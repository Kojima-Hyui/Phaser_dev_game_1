import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '@/utils/Constants';

export class UIScene extends Phaser.Scene {
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private expBarBg!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private expText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private creditText!: Phaser.GameObjects.Text;
  private totalCreditText!: Phaser.GameObjects.Text;
  private spText!: Phaser.GameObjects.Text;
  private bossHealthBarBg!: Phaser.GameObjects.Graphics;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;
  private warningText!: Phaser.GameObjects.Text;
  private bossActive: boolean = false;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create(): void {
    // HP バー背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(COLORS.HEALTH_BAR_BG, 1);
    this.healthBarBg.fillRect(20, 20, 200, 20);

    // HP バー
    this.healthBar = this.add.graphics();

    // HP テキスト
    this.healthText = this.add.text(20, 45, 'HP: 100/100', {
      fontSize: '16px',
      color: '#00ffff'
    });

    // レベルテキスト
    this.levelText = this.add.text(20, 70, 'Level: 1', {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    });

    // EXP バー背景
    this.expBarBg = this.add.graphics();
    this.expBarBg.fillStyle(COLORS.HEALTH_BAR_BG, 1);
    this.expBarBg.fillRect(20, 95, 200, 15);

    // EXP バー
    this.expBar = this.add.graphics();

    // EXP テキスト
    this.expText = this.add.text(20, 115, 'EXP: 0/100', {
      fontSize: '14px',
      color: '#ffff00'
    });

    // スコアテキスト
    this.scoreText = this.add.text(20, 140, 'Score: 0', {
      fontSize: '20px',
      color: '#00ffff'
    });

    // 武器テキスト
    this.weaponText = this.add.text(20, 170, 'Weapon: Pistol', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    });

    // クレジットテキスト
    this.creditText = this.add.text(20, 200, 'Credits: 0', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 総クレジットテキスト
    this.totalCreditText = this.add.text(20, 220, 'Total Credits: 0', {
      fontSize: '14px',
      color: '#ffaa00'
    });

    // SPテキスト
    this.spText = this.add.text(20, 245, 'SP: 0', {
      fontSize: '18px',
      color: '#ffaa00',
      fontStyle: 'bold'
    });

    // 操作説明
    this.add.text(20, 275, 'WASD: Move | Mouse: Aim | Space/Click: Shoot | 1-7: Weapon | TAB: Skills', {
      fontSize: '14px',
      color: '#666666'
    });

    // ボスHPバー背景（画面上部中央）
    this.bossHealthBarBg = this.add.graphics();
    this.bossHealthBarBg.fillStyle(COLORS.HEALTH_BAR_BG, 1);
    this.bossHealthBarBg.fillRect(GAME_WIDTH / 2 - 200, 50, 400, 25);
    this.bossHealthBarBg.setVisible(false);

    // ボスHPバー
    this.bossHealthBar = this.add.graphics();
    this.bossHealthBar.setVisible(false);

    // ボス名テキスト
    this.bossNameText = this.add.text(GAME_WIDTH / 2, 30, 'CYBER GUARDIAN', {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.bossNameText.setOrigin(0.5);
    this.bossNameText.setVisible(false);

    // 警告テキスト
    this.warningText = this.add.text(GAME_WIDTH / 2, 200, 'WARNING', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.warningText.setOrigin(0.5);
    this.warningText.setVisible(false);

    // GameSceneからのイベントを受信
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateUI', this.updateUI, this);
    gameScene.events.on('bossSpawned', this.onBossSpawned, this);
    gameScene.events.on('bossDefeated', this.onBossDefeated, this);
    gameScene.events.on('updateBossHealth', this.updateBossHealth, this);
  }

  private updateUI(data: {
    health: number;
    maxHealth: number;
    score: number;
    level: number;
    exp: number;
    expToNextLevel: number;
    currentWeapon: string;
    credits: number;
    skillPoints: number;
    totalCredits: number;
  }): void {
    // HP バーの更新
    const healthPercentage = data.health / data.maxHealth;
    this.healthBar.clear();
    this.healthBar.fillStyle(COLORS.HEALTH_BAR, 1);
    this.healthBar.fillRect(20, 20, 200 * healthPercentage, 20);

    // HP テキストの更新
    this.healthText.setText(`HP: ${Math.max(0, Math.floor(data.health))}/${data.maxHealth}`);

    // レベルテキストの更新
    this.levelText.setText(`Level: ${data.level}`);

    // EXP バーの更新
    const expPercentage = data.exp / data.expToNextLevel;
    this.expBar.clear();
    this.expBar.fillStyle(0xffff00, 1);
    this.expBar.fillRect(20, 95, 200 * expPercentage, 15);

    // EXP テキストの更新
    this.expText.setText(`EXP: ${Math.floor(data.exp)}/${data.expToNextLevel}`);

    // スコアテキストの更新
    this.scoreText.setText(`Score: ${data.score}`);

    // 武器テキストの更新
    this.weaponText.setText(`Weapon: ${data.currentWeapon}`);

    // クレジットテキストの更新
    this.creditText.setText(`Credits: ${data.credits}`);
    this.totalCreditText.setText(`Total Credits: ${data.totalCredits}`);

    // SPテキストの更新
    this.spText.setText(`SP: ${data.skillPoints}`);
  }

  private onBossSpawned(): void {
    this.bossActive = true;

    // 警告演出
    this.warningText.setVisible(true);
    this.warningText.setAlpha(1);

    // 点滅アニメーション
    this.tweens.add({
      targets: this.warningText,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.warningText.setVisible(false);
      }
    });

    // 画面シェイク
    this.cameras.main.shake(500, 0.01);

    // ボスHPバーを表示
    this.time.delayedCall(1500, () => {
      this.bossHealthBarBg.setVisible(true);
      this.bossHealthBar.setVisible(true);
      this.bossNameText.setVisible(true);
    });
  }

  private onBossDefeated(): void {
    this.bossActive = false;
    this.bossHealthBarBg.setVisible(false);
    this.bossHealthBar.setVisible(false);
    this.bossNameText.setVisible(false);
  }

  private updateBossHealth(data: { health: number; maxHealth: number }): void {
    if (!this.bossActive) return;

    const healthPercent = data.health / data.maxHealth;

    this.bossHealthBar.clear();
    // HPに応じて色を変える
    let barColor = 0xff0000;
    if (healthPercent > 0.66) {
      barColor = 0xff0000;
    } else if (healthPercent > 0.33) {
      barColor = 0xff8800;
    } else {
      barColor = 0xffff00;
    }
    this.bossHealthBar.fillStyle(barColor, 1);
    this.bossHealthBar.fillRect(GAME_WIDTH / 2 - 200, 50, 400 * healthPercent, 25);
  }
}
