import Phaser from 'phaser';
import { PLAYER, COLORS, WeaponType, ItemType } from '@/utils/Constants';
import { Weapon } from './Weapon';

export class Player extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  public health: number;
  public maxHealth: number;
  public level: number;
  public exp: number;
  public expToNextLevel: number;
  private speed: number;
  private baseDamage: number;
  private damageMultiplier: number;
  private weapons: Map<WeaponType, Weapon>;
  private currentWeapon!: Weapon;
  private unlockedWeapons: WeaponType[];
  private items: ItemType[];
  private speedBonus: number;
  private damageBonus: number;
  private fireRateBonus: number;
  private armor: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene);

    this.x = x;
    this.y = y;
    this.health = PLAYER.MAX_HEALTH;
    this.maxHealth = PLAYER.MAX_HEALTH;
    this.level = PLAYER.INITIAL_LEVEL;
    this.exp = 0;
    this.expToNextLevel = PLAYER.EXP_TO_NEXT_LEVEL_BASE;
    this.speed = PLAYER.SPEED;
    this.baseDamage = 15; // 基礎ダメージ（武器システムで上書きされる）
    this.damageMultiplier = 1.0;

    // プレイヤーの描画（三角形 - 方向を示す）
    this.drawPlayer();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);
    this.body.setSize(PLAYER.SIZE * 2, PLAYER.SIZE * 2);
    this.body.setOffset(-PLAYER.SIZE, -PLAYER.SIZE);

    // 武器システムの初期化
    this.weapons = new Map();
    this.unlockedWeapons = [WeaponType.PISTOL]; // 初期武器はピストルのみ

    // 初期武器を作成
    const pistol = new Weapon(scene, WeaponType.PISTOL);
    this.weapons.set(WeaponType.PISTOL, pistol);
    this.currentWeapon = pistol;

    // アイテムシステムの初期化
    this.items = [];
    this.speedBonus = 0;
    this.damageBonus = 0;
    this.fireRateBonus = 0;
    this.armor = 0;
  }

  private drawPlayer(): void {
    this.clear();
    this.fillStyle(COLORS.PLAYER, 1);
    this.lineStyle(2, COLORS.PLAYER, 1);

    // 三角形（上向き）
    this.beginPath();
    this.moveTo(0, -PLAYER.SIZE);
    this.lineTo(-PLAYER.SIZE, PLAYER.SIZE);
    this.lineTo(PLAYER.SIZE, PLAYER.SIZE);
    this.closePath();
    this.fillPath();
    this.strokePath();
  }

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: any): void {
    // 移動処理
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown || wasd.a.isDown) {
      velocityX = -this.speed;
    } else if (cursors.right.isDown || wasd.d.isDown) {
      velocityX = this.speed;
    }

    if (cursors.up.isDown || wasd.w.isDown) {
      velocityY = -this.speed;
    } else if (cursors.down.isDown || wasd.s.isDown) {
      velocityY = this.speed;
    }

    // 斜め移動の速度補正
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.body.setVelocity(velocityX, velocityY);
  }

  public aimAndRotate(pointer: Phaser.Input.Pointer): void {
    // マウス位置に向けて回転
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
    this.rotation = angle + Math.PI / 2;
  }

  public shoot(pointer: Phaser.Input.Pointer): void {
    // 現在の武器で射撃
    this.currentWeapon.fire(this.x, this.y, pointer.worldX, pointer.worldY);
  }

  public getBullets(): Phaser.GameObjects.Group {
    return this.currentWeapon.getBullets();
  }

  public switchWeapon(weaponType: WeaponType): boolean {
    // 武器がアンロックされているか確認
    if (!this.unlockedWeapons.includes(weaponType)) {
      return false;
    }

    // 武器が存在しない場合は作成
    if (!this.weapons.has(weaponType)) {
      const weapon = new Weapon(this.scene, weaponType);
      this.weapons.set(weaponType, weapon);
    }

    this.currentWeapon = this.weapons.get(weaponType)!;
    return true;
  }

  public unlockWeapon(weaponType: WeaponType): void {
    if (!this.unlockedWeapons.includes(weaponType)) {
      this.unlockedWeapons.push(weaponType);
    }
  }

  public getCurrentWeapon(): Weapon {
    return this.currentWeapon;
  }

  public getUnlockedWeapons(): WeaponType[] {
    return this.unlockedWeapons;
  }

  public takeDamage(damage: number): void {
    // アーマーによるダメージ軽減
    const actualDamage = damage * (1 - this.armor);
    this.health = Math.max(0, this.health - actualDamage);

    // ダメージを受けた時の視覚的フィードバック
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.health <= 0) {
      this.onDeath();
    }
  }

  public pickupItem(itemType: ItemType): void {
    this.items.push(itemType);
    this.applyItemEffect(itemType);
  }

  private applyItemEffect(itemType: ItemType): void {
    const ITEMS = require('@/utils/Constants').ITEMS;
    const config = ITEMS[itemType];

    switch (itemType) {
      case ItemType.SPEED_BOOST:
        this.speedBonus += config.effect;
        this.speed += config.effect;
        break;

      case ItemType.DAMAGE_UP:
        this.damageBonus += config.effect;
        this.damageMultiplier += config.effect;
        break;

      case ItemType.MAX_HP_UP:
        this.maxHealth += config.effect;
        this.health += config.effect; // HPも増加
        break;

      case ItemType.FIRE_RATE_UP:
        this.fireRateBonus += config.effect;
        // 武器の連射速度を更新
        break;

      case ItemType.ARMOR:
        this.armor += config.effect;
        // 最大50%まで
        this.armor = Math.min(this.armor, 0.5);
        break;
    }
  }

  public getItems(): ItemType[] {
    return this.items;
  }

  private onDeath(): void {
    console.log('Player died!');
    // TODO: ゲームオーバー処理
  }

  public getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  public gainExp(amount: number): void {
    this.exp += amount;

    // レベルアップチェック
    while (this.exp >= this.expToNextLevel) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.exp -= this.expToNextLevel;
    this.level++;

    // 次のレベルに必要な経験値を計算
    this.expToNextLevel = Math.floor(
      PLAYER.EXP_TO_NEXT_LEVEL_BASE * Math.pow(PLAYER.EXP_MULTIPLIER, this.level - 1)
    );

    // ステータス上昇
    this.maxHealth += PLAYER.LEVEL_UP_HP_GAIN;
    this.health = this.maxHealth; // HPを全回復
    this.damageMultiplier += PLAYER.LEVEL_UP_DAMAGE_MULTIPLIER;
    this.speed += PLAYER.LEVEL_UP_SPEED_GAIN;

    // レベルアップエフェクト
    this.showLevelUpEffect();

    console.log(`Level Up! Now Level ${this.level}`);
  }

  private showLevelUpEffect(): void {
    // 発光エフェクト
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    // レベルアップテキスト表示
    const levelUpText = this.scene.add.text(this.x, this.y - 50, 'LEVEL UP!', {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    levelUpText.setOrigin(0.5);

    // テキストが上に浮かび上がって消える
    this.scene.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        levelUpText.destroy();
      }
    });
  }

  public getExpPercentage(): number {
    return this.exp / this.expToNextLevel;
  }

  public getCurrentDamage(): number {
    return Math.floor(this.baseDamage * this.damageMultiplier);
  }
}
