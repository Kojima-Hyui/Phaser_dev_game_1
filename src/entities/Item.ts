import Phaser from 'phaser';
import { ItemType, ITEMS } from '@/utils/Constants';

export interface ItemConfig {
  name: string;
  description: string;
  effect: number;
  color: number;
  dropChance: number;
}

export class Item extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public itemType: ItemType;
  public config: ItemConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ItemType) {
    super(scene);

    this.x = x;
    this.y = y;
    this.itemType = type;
    this.config = ITEMS[type];

    // アイテムの描画（ダイヤモンド形状）
    this.drawItem();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(20, 20);
    this.body.setOffset(-10, -10);

    // 浮遊アニメーション
    scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 回転アニメーション
    scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private drawItem(): void {
    this.clear();
    this.fillStyle(this.config.color, 1);
    this.lineStyle(2, this.config.color, 1);

    // ダイヤモンド形状
    this.beginPath();
    this.moveTo(0, -10);
    this.lineTo(10, 0);
    this.lineTo(0, 10);
    this.lineTo(-10, 0);
    this.closePath();
    this.fillPath();
    this.strokePath();

    // 内側の小さなダイヤモンド
    this.fillStyle(0xffffff, 0.5);
    this.beginPath();
    this.moveTo(0, -5);
    this.lineTo(5, 0);
    this.lineTo(0, 5);
    this.lineTo(-5, 0);
    this.closePath();
    this.fillPath();
  }
}
