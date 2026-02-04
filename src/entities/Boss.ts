import Phaser from 'phaser';
import { ENEMY_TYPES, EnemyType } from '@/utils/Constants';
import { Player } from './Player';
import { EnemyBullet } from './EnemyBullet';

export enum BossPhase {
  PHASE_1 = 1,  // HP 100%-66%: 追跡 + 3発扇状射撃
  PHASE_2 = 2,  // HP 66%-33%: 8方向回転弾幕 + ダッシュ攻撃
  PHASE_3 = 3   // HP 33%-0%: 高速追跡 + 全方位弾幕
}

export class Boss extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public health: number;
  public maxHealth: number;
  public enemyType: EnemyType = EnemyType.BOSS;
  public scoreValue: number;
  private player: Player;
  private speed: number;
  private baseSpeed: number;
  private damage: number;
  private size: number;
  private color: number;
  private bullets: Phaser.GameObjects.Group;
  private currentPhase: BossPhase = BossPhase.PHASE_1;
  private lastShootTime: number = 0;
  private shootCooldown: number = 800;
  private lastDashTime: number = 0;
  private dashCooldown: number = 3000;
  private isDashing: boolean = false;
  private rotationAngle: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene);

    this.x = x;
    this.y = y;
    this.player = player;

    const config = ENEMY_TYPES[EnemyType.BOSS];
    this.speed = config.speed;
    this.baseSpeed = config.speed;
    this.health = config.health;
    this.maxHealth = config.health;
    this.damage = config.damage;
    this.size = config.size;
    this.color = config.color;
    this.scoreValue = config.score;

    this.bullets = scene.add.group({
      classType: EnemyBullet,
      runChildUpdate: false
    });

    this.drawBoss();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.size * 2, this.size * 2);
    this.body.setOffset(-this.size, -this.size);
  }

  private drawBoss(): void {
    this.clear();
    this.fillStyle(this.color, 1);
    this.lineStyle(3, this.color, 1);

    // 外側の円
    this.fillCircle(0, 0, this.size);
    this.strokeCircle(0, 0, this.size);

    // 内側の円（フェーズに応じて色を変える）
    let innerColor = 0xffff00;
    if (this.currentPhase === BossPhase.PHASE_2) {
      innerColor = 0xff8800;
    } else if (this.currentPhase === BossPhase.PHASE_3) {
      innerColor = 0xff0000;
    }
    this.lineStyle(3, innerColor, 1);
    this.strokeCircle(0, 0, this.size * 0.6);

    // 十字
    this.lineStyle(4, innerColor, 1);
    this.beginPath();
    this.moveTo(-this.size * 0.8, 0);
    this.lineTo(this.size * 0.8, 0);
    this.moveTo(0, -this.size * 0.8);
    this.lineTo(0, this.size * 0.8);
    this.strokePath();
  }

  public update(): void {
    if (!this.player || this.player.health <= 0) {
      this.body.setVelocity(0, 0);
      return;
    }

    this.updatePhase();

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);

    switch (this.currentPhase) {
      case BossPhase.PHASE_1:
        this.phase1Behavior(angle);
        break;
      case BossPhase.PHASE_2:
        this.phase2Behavior(angle);
        break;
      case BossPhase.PHASE_3:
        this.phase3Behavior(angle);
        break;
    }

    this.rotation = angle;
    this.rotationAngle += 0.02;
  }

  private updatePhase(): void {
    const healthPercent = this.health / this.maxHealth;
    let newPhase = this.currentPhase;

    if (healthPercent > 0.66) {
      newPhase = BossPhase.PHASE_1;
    } else if (healthPercent > 0.33) {
      newPhase = BossPhase.PHASE_2;
    } else {
      newPhase = BossPhase.PHASE_3;
    }

    if (newPhase !== this.currentPhase) {
      this.currentPhase = newPhase;
      this.onPhaseChange();
    }
  }

  private onPhaseChange(): void {
    this.drawBoss();

    // フェーズ変更時のエフェクト
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    // 速度調整
    if (this.currentPhase === BossPhase.PHASE_2) {
      this.speed = this.baseSpeed * 1.2;
      this.shootCooldown = 600;
    } else if (this.currentPhase === BossPhase.PHASE_3) {
      this.speed = this.baseSpeed * 1.5;
      this.shootCooldown = 400;
    }
  }

  private phase1Behavior(angle: number): void {
    // 追跡
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.body.setVelocity(velocityX, velocityY);

    // 3発扇状射撃
    this.shootFan(angle, 3, 0.3);
  }

  private phase2Behavior(angle: number): void {
    const currentTime = this.scene.time.now;

    // ダッシュ攻撃
    if (!this.isDashing && currentTime - this.lastDashTime >= this.dashCooldown) {
      this.startDash(angle);
    }

    if (!this.isDashing) {
      // 通常移動
      const velocityX = Math.cos(angle) * this.speed * 0.7;
      const velocityY = Math.sin(angle) * this.speed * 0.7;
      this.body.setVelocity(velocityX, velocityY);
    }

    // 8方向回転弾幕
    this.shootRotatingBullets(8);
  }

  private phase3Behavior(angle: number): void {
    // 高速追跡
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.body.setVelocity(velocityX, velocityY);

    // 全方位弾幕（16方向）
    this.shootRotatingBullets(16);
  }

  private shootFan(baseAngle: number, count: number, spread: number): void {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }
    this.lastShootTime = currentTime;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + spread * (i - (count - 1) / 2);
      const velocityX = Math.cos(angle) * 300;
      const velocityY = Math.sin(angle) * 300;

      const bullet = new EnemyBullet(this.scene, this.x, this.y, velocityX, velocityY, this.damage);
      this.bullets.add(bullet);
    }
  }

  private shootRotatingBullets(count: number): void {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }
    this.lastShootTime = currentTime;

    for (let i = 0; i < count; i++) {
      const angle = this.rotationAngle + (Math.PI * 2 / count) * i;
      const velocityX = Math.cos(angle) * 250;
      const velocityY = Math.sin(angle) * 250;

      const bullet = new EnemyBullet(this.scene, this.x, this.y, velocityX, velocityY, this.damage);
      this.bullets.add(bullet);
    }
  }

  private startDash(angle: number): void {
    this.isDashing = true;
    this.lastDashTime = this.scene.time.now;

    // ダッシュ速度
    const dashSpeed = this.speed * 4;
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;
    this.body.setVelocity(velocityX, velocityY);

    // ダッシュエフェクト
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // ダッシュ終了
    this.scene.time.delayedCall(400, () => {
      this.isDashing = false;
    });
  }

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  public takeDamage(damage: number): void {
    this.health -= damage;

    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true
    });

    if (this.health <= 0) {
      this.onDeath();
    }
  }

  private onDeath(): void {
    // 死亡エフェクトはGameSceneで処理
    this.destroy();
  }

  public getDamage(): number {
    return this.damage;
  }

  public getPhase(): BossPhase {
    return this.currentPhase;
  }

  public destroy(fromScene?: boolean): void {
    if (this.bullets) {
      this.bullets.clear(true, true);
    }
    super.destroy(fromScene);
  }
}
