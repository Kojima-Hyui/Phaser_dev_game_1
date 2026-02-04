import Phaser from 'phaser';
import { COLORS } from '@/utils/Constants';

export class EnemyBullet extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public damage: number;
  private lifeTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, velocityX: number, velocityY: number, damage: number) {
    super(scene);

    this.x = x;
    this.y = y;
    this.damage = damage;

    // 敵の弾丸の描画（赤い円）
    this.fillStyle(COLORS.ENEMY, 1);
    this.fillCircle(0, 0, 5);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 速度を設定
    this.body.setVelocity(velocityX, velocityY);
    this.body.setCircle(5);

    // 寿命タイマー
    this.lifeTimer = scene.time.delayedCall(3000, () => {
      this.destroy();
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.lifeTimer) {
      this.lifeTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
