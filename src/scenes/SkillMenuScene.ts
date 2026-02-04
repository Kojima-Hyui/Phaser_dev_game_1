import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SkillType, SkillCategory, SKILLS } from '@/utils/Constants';
import { Player } from '@/entities/Player';

interface SkillButton {
  container: Phaser.GameObjects.Container;
  skillType: SkillType;
  levelText: Phaser.GameObjects.Text;
  costText: Phaser.GameObjects.Text;
}

export class SkillMenuScene extends Phaser.Scene {
  private player!: Player;
  private background!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private spText!: Phaser.GameObjects.Text;
  private skillButtons: SkillButton[] = [];
  private statsTexts: Phaser.GameObjects.Text[] = [];
  private categoryTabs: Phaser.GameObjects.Container[] = [];
  private currentCategory: SkillCategory = SkillCategory.OFFENSE;
  private closeHint!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SkillMenuScene' });
  }

  init(data: { player: Player }): void {
    this.player = data.player;
  }

  create(): void {
    // 半透明の背景
    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.85);
    this.background.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // タイトル
    this.titleText = this.add.text(GAME_WIDTH / 2, 40, 'SKILL MENU', {
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    this.titleText.setOrigin(0.5);

    // SP表示
    this.spText = this.add.text(GAME_WIDTH / 2, 80, `SP: ${this.player.skillPoints}`, {
      fontSize: '24px',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    this.spText.setOrigin(0.5);

    // 閉じるヒント
    this.closeHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'Press TAB to close', {
      fontSize: '16px',
      color: '#666666'
    });
    this.closeHint.setOrigin(0.5);

    // カテゴリタブを作成
    this.createCategoryTabs();

    // ステータス表示エリア
    this.createStatsPanel();

    // スキル一覧を作成
    this.createSkillList();

    // TABキーで閉じる
    this.input.keyboard!.on('keydown-TAB', () => {
      this.closeMenu();
    });

    // ESCキーでも閉じる
    this.input.keyboard!.on('keydown-ESC', () => {
      this.closeMenu();
    });
  }

  private createCategoryTabs(): void {
    const categories = [
      { type: SkillCategory.OFFENSE, name: 'OFFENSE', color: 0xff4444 },
      { type: SkillCategory.DEFENSE, name: 'DEFENSE', color: 0x44ff44 },
      { type: SkillCategory.UTILITY, name: 'UTILITY', color: 0x4444ff }
    ];

    const tabWidth = 150;
    const tabHeight = 35;
    const startX = GAME_WIDTH / 2 - (categories.length * tabWidth) / 2;

    categories.forEach((cat, index) => {
      const x = startX + index * tabWidth + tabWidth / 2;
      const y = 130;

      const container = this.add.container(x, y);

      const bg = this.add.graphics();
      bg.fillStyle(cat.type === this.currentCategory ? cat.color : 0x333333, 1);
      bg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 5);
      container.add(bg);

      const text = this.add.text(0, 0, cat.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      container.add(text);

      // クリックイベント
      container.setSize(tabWidth, tabHeight);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        this.currentCategory = cat.type;
        this.refreshCategoryTabs();
        this.refreshSkillList();
      });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(cat.color, 0.8);
        bg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 5);
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(cat.type === this.currentCategory ? cat.color : 0x333333, 1);
        bg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 5);
      });

      this.categoryTabs.push(container);
    });
  }

  private refreshCategoryTabs(): void {
    const categories = [
      { type: SkillCategory.OFFENSE, color: 0xff4444 },
      { type: SkillCategory.DEFENSE, color: 0x44ff44 },
      { type: SkillCategory.UTILITY, color: 0x4444ff }
    ];

    this.categoryTabs.forEach((container, index) => {
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics;
      const cat = categories[index];
      bg.clear();
      bg.fillStyle(cat.type === this.currentCategory ? cat.color : 0x333333, 1);
      bg.fillRoundedRect(-75, -17.5, 150, 35, 5);
    });
  }

  private createStatsPanel(): void {
    const panelX = 50;
    const panelY = 180;
    const lineHeight = 22;

    // パネル背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2e, 1);
    panelBg.lineStyle(2, 0x00ffff, 0.5);
    panelBg.fillRoundedRect(panelX - 10, panelY - 10, 280, 320, 10);
    panelBg.strokeRoundedRect(panelX - 10, panelY - 10, 280, 320, 10);

    // タイトル
    this.add.text(panelX, panelY, 'STATS', {
      fontSize: '20px',
      color: '#00ffff',
      fontStyle: 'bold'
    });

    const stats = this.player.getStats();
    const statsData = [
      { label: 'Level', value: this.player.level.toString(), color: '#ffffff' },
      { label: 'Total EXP', value: this.player.totalExp.toString(), color: '#ffff00' },
      { label: 'HP', value: `${Math.floor(stats.health)}/${stats.maxHealth}`, color: '#00ff00' },
      { label: 'Speed', value: Math.floor(stats.speed).toString(), color: '#ffff00' },
      { label: 'Damage', value: `${Math.floor(stats.damageMultiplier * 100)}%`, color: '#ff4444' },
      { label: 'Armor', value: `${Math.floor(stats.armor * 100)}%`, color: '#888888' },
      { label: 'Evasion', value: `${Math.floor(stats.evasion * 100)}%`, color: '#00aaff' },
      { label: 'Extra Bullets', value: `+${stats.extraBullets}`, color: '#ff00aa' },
      { label: 'Magnet Range', value: `+${stats.magnetRange}px`, color: '#6666ff' },
      { label: 'EXP Bonus', value: `+${Math.floor(stats.expBonus * 100)}%`, color: '#aa00ff' },
      { label: 'Drop Bonus', value: `+${Math.floor(stats.dropBonus * 100)}%`, color: '#ffaa00' },
      { label: 'HP Regen', value: `${stats.regenRate}/s`, color: '#00ff88' }
    ];

    statsData.forEach((stat, index) => {
      const y = panelY + 35 + index * lineHeight;

      const labelText = this.add.text(panelX, y, stat.label + ':', {
        fontSize: '14px',
        color: '#aaaaaa'
      });

      const valueText = this.add.text(panelX + 150, y, stat.value, {
        fontSize: '14px',
        color: stat.color
      });

      this.statsTexts.push(labelText, valueText);
    });
  }

  private createSkillList(): void {
    this.refreshSkillList();
  }

  private refreshSkillList(): void {
    // 既存のスキルボタンを削除
    this.skillButtons.forEach(btn => btn.container.destroy());
    this.skillButtons = [];

    // カテゴリに属するスキルをフィルタ
    const skillsInCategory = Object.entries(SKILLS)
      .filter(([_, config]) => config.category === this.currentCategory)
      .map(([type, _]) => type as SkillType);

    const startX = 380;
    const startY = 180;
    const buttonWidth = 400;
    const buttonHeight = 70;
    const spacing = 10;

    skillsInCategory.forEach((skillType, index) => {
      const config = SKILLS[skillType];
      const currentLevel = this.player.getSkillLevel(skillType);
      const cost = this.player.getSkillCost(skillType);
      const isMaxed = currentLevel >= config.maxLevel;
      const canAfford = this.player.skillPoints >= cost;

      const y = startY + index * (buttonHeight + spacing);
      const container = this.add.container(startX, y);

      // ボタン背景
      const bg = this.add.graphics();
      const bgColor = isMaxed ? 0x004400 : (canAfford ? 0x2a2a4a : 0x1a1a2a);
      bg.fillStyle(bgColor, 1);
      bg.lineStyle(2, config.color, isMaxed ? 1 : 0.5);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
      container.add(bg);

      // スキル名
      const nameText = this.add.text(15, 10, config.name, {
        fontSize: '18px',
        color: isMaxed ? '#00ff00' : '#ffffff',
        fontStyle: 'bold'
      });
      container.add(nameText);

      // 説明
      const descText = this.add.text(15, 35, config.description, {
        fontSize: '12px',
        color: '#888888'
      });
      container.add(descText);

      // レベル表示
      const levelText = this.add.text(buttonWidth - 100, 15, `Lv.${currentLevel}/${config.maxLevel}`, {
        fontSize: '16px',
        color: isMaxed ? '#00ff00' : '#ffffff'
      });
      container.add(levelText);

      // コスト表示
      const costColor = isMaxed ? '#00ff00' : (canAfford ? '#ffaa00' : '#ff4444');
      const costText = this.add.text(buttonWidth - 100, 40, isMaxed ? 'MAX' : `Cost: ${cost} SP`, {
        fontSize: '14px',
        color: costColor
      });
      container.add(costText);

      // クリックイベント（maxでない場合のみ）
      if (!isMaxed) {
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive({ useHandCursor: canAfford });

        container.on('pointerover', () => {
          if (canAfford) {
            bg.clear();
            bg.fillStyle(0x3a3a5a, 1);
            bg.lineStyle(2, config.color, 1);
            bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
            bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
          }
        });

        container.on('pointerout', () => {
          bg.clear();
          bg.fillStyle(canAfford ? 0x2a2a4a : 0x1a1a2a, 1);
          bg.lineStyle(2, config.color, 0.5);
          bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
          bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
        });

        container.on('pointerdown', () => {
          if (canAfford) {
            this.upgradeSkill(skillType);
          }
        });
      }

      this.skillButtons.push({
        container,
        skillType,
        levelText,
        costText
      });
    });
  }

  private upgradeSkill(skillType: SkillType): void {
    const success = this.player.upgradeSkill(skillType);

    if (success) {
      // エフェクト
      this.cameras.main.flash(100, 255, 170, 0);

      // UI更新
      this.spText.setText(`SP: ${this.player.skillPoints}`);
      this.refreshSkillList();
      this.refreshStats();
    }
  }

  private refreshStats(): void {
    // ステータステキストを更新
    this.statsTexts.forEach(text => text.destroy());
    this.statsTexts = [];

    const panelX = 50;
    const panelY = 180;
    const lineHeight = 22;

    const stats = this.player.getStats();
    const statsData = [
      { label: 'Level', value: this.player.level.toString(), color: '#ffffff' },
      { label: 'Total EXP', value: this.player.totalExp.toString(), color: '#ffff00' },
      { label: 'HP', value: `${Math.floor(stats.health)}/${stats.maxHealth}`, color: '#00ff00' },
      { label: 'Speed', value: Math.floor(stats.speed).toString(), color: '#ffff00' },
      { label: 'Damage', value: `${Math.floor(stats.damageMultiplier * 100)}%`, color: '#ff4444' },
      { label: 'Armor', value: `${Math.floor(stats.armor * 100)}%`, color: '#888888' },
      { label: 'Evasion', value: `${Math.floor(stats.evasion * 100)}%`, color: '#00aaff' },
      { label: 'Extra Bullets', value: `+${stats.extraBullets}`, color: '#ff00aa' },
      { label: 'Magnet Range', value: `+${stats.magnetRange}px`, color: '#6666ff' },
      { label: 'EXP Bonus', value: `+${Math.floor(stats.expBonus * 100)}%`, color: '#aa00ff' },
      { label: 'Drop Bonus', value: `+${Math.floor(stats.dropBonus * 100)}%`, color: '#ffaa00' },
      { label: 'HP Regen', value: `${stats.regenRate}/s`, color: '#00ff88' }
    ];

    statsData.forEach((stat, index) => {
      const y = panelY + 35 + index * lineHeight;

      const labelText = this.add.text(panelX, y, stat.label + ':', {
        fontSize: '14px',
        color: '#aaaaaa'
      });

      const valueText = this.add.text(panelX + 150, y, stat.value, {
        fontSize: '14px',
        color: stat.color
      });

      this.statsTexts.push(labelText, valueText);
    });
  }

  private closeMenu(): void {
    // GameSceneにメニューを閉じることを通知
    const gameScene = this.scene.get('GameScene');
    gameScene.events.emit('skillMenuClosed');
    this.scene.stop();
  }

  update(): void {
    // SP表示を常に更新
    this.spText.setText(`SP: ${this.player.skillPoints}`);
  }
}
