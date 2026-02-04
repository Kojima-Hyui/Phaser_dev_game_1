import Phaser from 'phaser';
import { WeaponType, WEAPONS } from '@/utils/Constants';
import { Bullet } from './Bullet';

export interface WeaponConfig {
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletCount: number;
  spread: number;
  penetration: boolean;
  color: number;
  explosionRadius: number;
}

export class Weapon {
  public type: WeaponType;
  public config: WeaponConfig;
  private scene: Phaser.Scene;
  private lastFireTime: number = 0;
  private bullets: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, type: WeaponType) {
    this.scene = scene;
    this.type = type;
    this.config = WEAPONS[type];

    // 弾丸グループの作成
    this.bullets = scene.add.group({
      classType: Bullet,
      runChildUpdate: false
    });
  }

  public canFire(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= this.config.fireRate;
  }

  public fire(x: number, y: number, targetX: number, targetY: number, extraBulletCount: number = 0): void {
    const currentTime = this.scene.time.now;

    if (!this.canFire(currentTime)) {
      return;
    }

    this.lastFireTime = currentTime;

    // 基本角度を計算
    const baseAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);

    // 複数弾を発射（extraBulletCount を加算）
    const totalBullets = this.config.bulletCount + extraBulletCount;
    for (let i = 0; i < totalBullets; i++) {
      let angle = baseAngle;

      // 散弾の場合、角度をずらす
      if (totalBullets > 1) {
        const spread = this.config.spread > 0 ? this.config.spread : 0.15; // デフォルトspread
        const spreadOffset = spread * (i - (totalBullets - 1) / 2);
        angle += spreadOffset;
      }

      const velocityX = Math.cos(angle) * this.config.bulletSpeed;
      const velocityY = Math.sin(angle) * this.config.bulletSpeed;

      // 弾丸を生成
      const bullet = new Bullet(
        this.scene,
        x,
        y,
        velocityX,
        velocityY,
        this.config.damage,
        this.config.bulletSize,
        this.config.color,
        this.config.penetration,
        this.config.explosionRadius
      );

      this.bullets.add(bullet);
    }
  }

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  public destroy(): void {
    this.bullets.clear(true, true);
  }
}
