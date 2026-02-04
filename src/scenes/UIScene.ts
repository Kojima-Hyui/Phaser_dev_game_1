import Phaser from 'phaser';
import { COLORS } from '@/utils/Constants';

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

    // 操作説明
    this.add.text(20, 250, 'WASD: Move | Mouse: Aim | Space/Click: Shoot | 1-5: Weapon', {
      fontSize: '14px',
      color: '#666666'
    });

    // GameSceneからのイベントを受信
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateUI', this.updateUI, this);
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
  }
}
