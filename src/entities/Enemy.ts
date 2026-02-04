import Phaser from 'phaser';
import { ENEMY, ENEMY_TYPES, EnemyType } from '@/utils/Constants';
import { Player } from './Player';
import { EnemyBullet } from './EnemyBullet';

export class Enemy extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public health: number;
  public maxHealth: number;
  public enemyType: EnemyType;
  public scoreValue: number;
  private player: Player;
  private speed: number;
  private damage: number;
  private size: number;
  private color: number;
  private lastShootTime: number = 0;
  private bullets?: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player, type: EnemyType = EnemyType.CHASER) {
    super(scene);

    this.x = x;
    this.y = y;
    this.player = player;
    this.enemyType = type;

    // タイプに応じた設定を取得
    const config = ENEMY_TYPES[type];
    this.speed = config.speed;
    this.health = config.health;
    this.maxHealth = config.health;
    this.damage = config.damage;
    this.size = config.size;
    this.color = config.color;
    this.scoreValue = config.score;

    // Shooterタイプの場合、弾丸グループを作成
    if (type === EnemyType.SHOOTER) {
      this.bullets = scene.add.group({
        classType: EnemyBullet,
        runChildUpdate: false
      });
    }

    // 敵の描画
    this.drawEnemy();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.size * 2, this.size * 2);
    this.body.setOffset(-this.size, -this.size);
  }

  private drawEnemy(): void {
    this.clear();
    this.fillStyle(this.color, 1);
    this.lineStyle(2, this.color, 1);

    // タイプに応じた形状
    switch (this.enemyType) {
      case EnemyType.CHASER:
        // 四角形
        this.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        this.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);
        break;

      case EnemyType.SHOOTER:
        // 六角形
        this.drawHexagon();
        break;

      case EnemyType.SPEEDY:
        // 三角形（小さい）
        this.beginPath();
        this.moveTo(0, -this.size);
        this.lineTo(-this.size, this.size);
        this.lineTo(this.size, this.size);
        this.closePath();
        this.fillPath();
        this.strokePath();
        break;

      case EnemyType.TANK:
        // 大きな八角形
        this.drawOctagon();
        break;
    }
  }

  private drawHexagon(): void {
    this.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) {
        this.moveTo(x, y);
      } else {
        this.lineTo(x, y);
      }
    }
    this.closePath();
    this.fillPath();
    this.strokePath();
  }

  private drawOctagon(): void {
    this.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) {
        this.moveTo(x, y);
      } else {
        this.lineTo(x, y);
      }
    }
    this.closePath();
    this.fillPath();
    this.strokePath();
  }

  public update(): void {
    if (!this.player || this.player.health <= 0) {
      this.body.setVelocity(0, 0);
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);

    // タイプに応じた動作
    switch (this.enemyType) {
      case EnemyType.CHASER:
      case EnemyType.SPEEDY:
      case EnemyType.TANK:
        // プレイヤーに向かって移動
        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;
        this.body.setVelocity(velocityX, velocityY);
        this.rotation = angle;
        break;

      case EnemyType.SHOOTER:
        // 一定距離を保ちながら射撃
        if (distance > ENEMY.SHOOT_RANGE + 50) {
          // 遠すぎる場合は近づく
          const approachX = Math.cos(angle) * this.speed;
          const approachY = Math.sin(angle) * this.speed;
          this.body.setVelocity(approachX, approachY);
        } else if (distance < ENEMY.SHOOT_RANGE - 50) {
          // 近すぎる場合は離れる
          const retreatX = -Math.cos(angle) * this.speed;
          const retreatY = -Math.sin(angle) * this.speed;
          this.body.setVelocity(retreatX, retreatY);
        } else {
          // 適切な距離なら停止
          this.body.setVelocity(0, 0);
        }

        this.rotation = angle;

        // 射撃
        if (distance <= ENEMY.SHOOT_RANGE) {
          this.shoot();
        }
        break;
    }
  }

  private shoot(): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastShootTime < ENEMY.SHOOT_COOLDOWN) {
      return;
    }

    this.lastShootTime = currentTime;

    // 弾丸の速度を計算
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const velocityX = Math.cos(angle) * 300;
    const velocityY = Math.sin(angle) * 300;

    // 弾丸を生成
    const bullet = new EnemyBullet(this.scene, this.x, this.y, velocityX, velocityY, this.damage);
    if (this.bullets) {
      this.bullets.add(bullet);
    }
  }

  public getBullets(): Phaser.GameObjects.Group | undefined {
    return this.bullets;
  }

  public takeDamage(damage: number): void {
    this.health -= damage;

    // ダメージを受けた時の視覚的フィードバック
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true
    });

    if (this.health <= 0) {
      this.destroy();
    }
  }

  public getDamage(): number {
    return this.damage;
  }

  public destroy(fromScene?: boolean): void {
    // 弾丸グループもクリーンアップ
    if (this.bullets) {
      this.bullets.clear(true, true);
    }
    super.destroy(fromScene);
  }
}
