import Phaser from 'phaser';
import { BULLET, COLORS } from '@/utils/Constants';

export class Bullet extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public damage: number;
  public penetration: boolean;
  public explosionRadius: number;
  private lifeTimer: Phaser.Time.TimerEvent;
  private bulletSize: number;
  private hitCount: number = 0;
  private maxHits: number = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    damage?: number,
    size?: number,
    color?: number,
    penetration?: boolean,
    explosionRadius?: number
  ) {
    super(scene);

    this.x = x;
    this.y = y;
    this.damage = damage !== undefined ? damage : BULLET.DAMAGE;
    this.bulletSize = size !== undefined ? size : BULLET.SIZE;
    this.penetration = penetration !== undefined ? penetration : false;
    this.explosionRadius = explosionRadius !== undefined ? explosionRadius : 0;

    // 貫通弾の場合、複数回ヒット可能
    if (this.penetration) {
      this.maxHits = 3;
    }

    // 弾丸の描画
    const bulletColor = color !== undefined ? color : COLORS.BULLET;
    this.fillStyle(bulletColor, 1);
    this.fillCircle(0, 0, this.bulletSize);

    // 貫通弾の場合、グローエフェクト
    if (this.penetration) {
      this.lineStyle(2, bulletColor, 0.5);
      this.strokeCircle(0, 0, this.bulletSize + 2);
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 速度を設定
    this.body.setVelocity(velocityX, velocityY);
    this.body.setCircle(this.bulletSize);

    // 寿命タイマー
    this.lifeTimer = scene.time.delayedCall(BULLET.LIFETIME, () => {
      this.destroy();
    });
  }

  public onHit(): boolean {
    this.hitCount++;

    // 貫通弾でない場合、または最大ヒット数に達した場合は破壊
    if (!this.penetration || this.hitCount >= this.maxHits) {
      this.destroy();
      return true; // 弾丸が破壊された
    }

    return false; // 弾丸は継続
  }

  public destroy(fromScene?: boolean): void {
    if (this.lifeTimer) {
      this.lifeTimer.destroy();
    }
    super.destroy(fromScene);
  }
}
