import Phaser from 'phaser';
import { CURRENCY } from '@/utils/Constants';

export class Credit extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public value: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene);

    this.x = x;
    this.y = y;
    this.value = CURRENCY.CREDIT_VALUE;

    // クレジットの描画（コイン形状）
    this.drawCredit();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(16, 16);
    this.body.setOffset(-8, -8);

    // 浮遊アニメーション
    scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // スケールアニメーション
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawCredit(): void {
    this.clear();
    this.fillStyle(CURRENCY.CREDIT_COLOR, 1);
    this.lineStyle(2, 0xffaa00, 1);

    // コイン形状（円）
    this.fillCircle(0, 0, 8);
    this.strokeCircle(0, 0, 8);

    // 内側の記号
    this.fillStyle(0xffaa00, 1);
    this.fillCircle(0, 0, 4);
  }
}
