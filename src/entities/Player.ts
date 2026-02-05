import Phaser from 'phaser';
import { PLAYER, COLORS, WeaponType, ItemType, ITEMS, SkillType, SKILLS, SKILL_POINT } from '@/utils/Constants';
import { Weapon } from './Weapon';
import { KeyboardControls } from '@/types/controls';

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
  private extraBulletCount: number;
  public magnetRange: number;

  // スキルポイントシステム
  public skillPoints: number;
  public totalExp: number;
  private lastBonusSPExp: number;
  private skillLevels: Map<SkillType, number>;

  // スキル効果用
  private skillDamageBonus: number;
  private skillFireRateBonus: number;
  private skillArmorBonus: number;
  private skillSpeedBonus: number;
  private skillExtraBullets: number;
  private skillMagnetBonus: number;
  private skillExpBonus: number;
  private skillDropBonus: number;
  private skillRegenRate: number;
  private skillEvasion: number;
  private skillPenetrationBonus: number;
  private skillExplosionBonus: number;
  private regenTimer: number;

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
    this.extraBulletCount = 0;
    this.magnetRange = 0;

    // スキルポイントシステムの初期化
    this.skillPoints = 0;
    this.totalExp = 0;
    this.lastBonusSPExp = 0;
    this.skillLevels = new Map();

    // スキル効果の初期化
    this.skillDamageBonus = 0;
    this.skillFireRateBonus = 0;
    this.skillArmorBonus = 0;
    this.skillSpeedBonus = 0;
    this.skillExtraBullets = 0;
    this.skillMagnetBonus = 0;
    this.skillExpBonus = 0;
    this.skillDropBonus = 0;
    this.skillRegenRate = 0;
    this.skillEvasion = 0;
    this.skillPenetrationBonus = 0;
    this.skillExplosionBonus = 0;
    this.regenTimer = 0;
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

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: KeyboardControls): void {
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
    // 現在の武器で射撃（アイテム + スキルの追加弾数を渡す）
    this.currentWeapon.fire(this.x, this.y, pointer.worldX, pointer.worldY, this.getTotalExtraBullets());
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

  public pickupItem(itemType: ItemType): void {
    this.items.push(itemType);
    this.applyItemEffect(itemType);
  }

  private applyItemEffect(itemType: ItemType): void {
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

      case ItemType.HEALTH_REGEN:
        // 即時HP回復
        this.health = Math.min(this.health + config.effect, this.maxHealth);
        break;

      case ItemType.MULTI_SHOT:
        // 弾数+1
        this.extraBulletCount += config.effect;
        break;

      case ItemType.MAGNET:
        // アイテム/クレジット回収範囲+100px
        this.magnetRange += config.effect;
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
    // EXP値の妥当性チェック
    if (!isFinite(amount) || amount < 0) {
      console.warn('Invalid exp amount:', amount);
      return;
    }

    // EXPボーナスを適用
    const bonusAmount = Math.floor(amount * (1 + this.skillExpBonus));
    this.exp += bonusAmount;
    this.totalExp += bonusAmount;

    // ボーナスSPチェック（累計経験値500ごと）
    while (this.totalExp >= this.lastBonusSPExp + SKILL_POINT.EXP_FOR_BONUS_SP) {
      this.skillPoints += 1;
      this.lastBonusSPExp += SKILL_POINT.EXP_FOR_BONUS_SP;
      this.showSPGainEffect();
    }

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

    // スキルポイント獲得
    this.skillPoints += SKILL_POINT.SP_PER_LEVEL;

    // レベルアップエフェクト
    this.showLevelUpEffect();

    console.log(`Level Up! Now Level ${this.level}, SP: ${this.skillPoints}`);
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

  // SP獲得エフェクト
  private showSPGainEffect(): void {
    const spText = this.scene.add.text(this.x, this.y - 70, '+1 SP', {
      fontSize: '20px',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    spText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: spText,
      y: spText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        spText.destroy();
      }
    });
  }

  // スキルレベル取得
  public getSkillLevel(skillType: SkillType): number {
    return this.skillLevels.get(skillType) || 0;
  }

  // スキル習得/強化
  public upgradeSkill(skillType: SkillType): boolean {
    const config = SKILLS[skillType];
    const currentLevel = this.getSkillLevel(skillType);

    // 最大レベルチェック
    if (currentLevel >= config.maxLevel) {
      return false;
    }

    // コスト計算
    const cost = config.baseCost + (currentLevel * config.costPerLevel);

    // SP不足チェック
    if (this.skillPoints < cost) {
      return false;
    }

    // SP消費してレベルアップ
    this.skillPoints -= cost;
    this.skillLevels.set(skillType, currentLevel + 1);

    // スキル効果を再計算
    this.recalculateSkillEffects();

    return true;
  }

  // スキルコスト計算
  public getSkillCost(skillType: SkillType): number {
    const config = SKILLS[skillType];
    const currentLevel = this.getSkillLevel(skillType);
    return config.baseCost + (currentLevel * config.costPerLevel);
  }

  // スキル効果再計算
  private recalculateSkillEffects(): void {
    // リセット
    this.skillDamageBonus = 0;
    this.skillFireRateBonus = 0;
    this.skillArmorBonus = 0;
    this.skillSpeedBonus = 0;
    this.skillExtraBullets = 0;
    this.skillMagnetBonus = 0;
    this.skillExpBonus = 0;
    this.skillDropBonus = 0;
    this.skillRegenRate = 0;
    this.skillEvasion = 0;
    this.skillPenetrationBonus = 0;
    this.skillExplosionBonus = 0;

    // 各スキルの効果を計算
    this.skillLevels.forEach((level, skillType) => {
      const config = SKILLS[skillType];
      const effect = config.effectPerLevel * level;

      switch (skillType) {
        case SkillType.POWER_SHOT:
          this.skillDamageBonus = effect;
          break;
        case SkillType.RAPID_FIRE:
          this.skillFireRateBonus = effect;
          break;
        case SkillType.PIERCING_ROUNDS:
          this.skillPenetrationBonus = effect;
          break;
        case SkillType.EXPLOSIVE_ROUNDS:
          this.skillExplosionBonus = effect;
          break;
        case SkillType.MULTI_SHOT:
          this.skillExtraBullets = effect;
          break;
        case SkillType.VITALITY:
          // 最大HP増加（即時適用）
          const hpGain = effect - (config.effectPerLevel * (level - 1));
          if (hpGain > 0) {
            this.maxHealth += hpGain;
            this.health += hpGain;
          }
          break;
        case SkillType.REGENERATION:
          this.skillRegenRate = effect;
          break;
        case SkillType.ARMOR_PLATING:
          this.skillArmorBonus = effect;
          break;
        case SkillType.EVASION:
          this.skillEvasion = effect;
          break;
        case SkillType.SPEED_BOOST:
          this.skillSpeedBonus = effect;
          break;
        case SkillType.MAGNETISM:
          this.skillMagnetBonus = effect;
          break;
        case SkillType.LUCKY:
          this.skillDropBonus = effect;
          break;
        case SkillType.EXP_BOOST:
          this.skillExpBonus = effect;
          break;
      }
    });
  }

  // HP自動回復処理（毎フレーム呼び出し）
  public updateRegen(delta: number): void {
    if (this.skillRegenRate > 0 && this.health < this.maxHealth) {
      this.regenTimer += delta;
      if (this.regenTimer >= 1000) { // 1秒ごと
        this.health = Math.min(this.health + this.skillRegenRate, this.maxHealth);
        this.regenTimer = 0;
      }
    }
  }

  // ダメージ処理（回避判定含む）
  public takeDamage(damage: number): boolean {
    // ダメージ値の妥当性チェック
    if (!isFinite(damage) || damage < 0) {
      console.warn('Invalid damage value:', damage);
      return false;
    }

    // 回避判定
    if (this.skillEvasion > 0 && Math.random() < this.skillEvasion) {
      // 回避成功エフェクト
      this.showDodgeEffect();
      return false;
    }

    // アーマーによるダメージ軽減（アイテム + スキル）
    const totalArmor = Math.min(this.armor + this.skillArmorBonus, 0.75); // 最大75%軽減
    const actualDamage = damage * (1 - totalArmor);
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

    return true;
  }

  private showDodgeEffect(): void {
    const dodgeText = this.scene.add.text(this.x, this.y - 30, 'DODGE!', {
      fontSize: '16px',
      color: '#00aaff',
      fontStyle: 'bold'
    });
    dodgeText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: dodgeText,
      y: dodgeText.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        dodgeText.destroy();
      }
    });
  }

  // ステータス取得メソッド（UI用）
  public getStats(): {
    health: number;
    maxHealth: number;
    speed: number;
    damageMultiplier: number;
    armor: number;
    evasion: number;
    magnetRange: number;
    extraBullets: number;
    expBonus: number;
    dropBonus: number;
    regenRate: number;
    fireRateBonus: number;
    penetrationBonus: number;
    explosionBonus: number;
  } {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed + this.skillSpeedBonus,
      damageMultiplier: this.damageMultiplier + this.skillDamageBonus,
      armor: Math.min(this.armor + this.skillArmorBonus, 0.75),
      evasion: this.skillEvasion,
      magnetRange: this.magnetRange + this.skillMagnetBonus,
      extraBullets: this.extraBulletCount + this.skillExtraBullets,
      expBonus: this.skillExpBonus,
      dropBonus: this.skillDropBonus,
      regenRate: this.skillRegenRate,
      fireRateBonus: this.skillFireRateBonus,
      penetrationBonus: this.skillPenetrationBonus,
      explosionBonus: this.skillExplosionBonus
    };
  }

  // スキルレベル一覧取得
  public getAllSkillLevels(): Map<SkillType, number> {
    return this.skillLevels;
  }

  // ドロップ率ボーナス取得
  public getDropBonus(): number {
    return this.skillDropBonus;
  }

  // 追加弾数取得（アイテム + スキル）
  public getTotalExtraBullets(): number {
    return this.extraBulletCount + this.skillExtraBullets;
  }

  // 実効速度取得
  public getEffectiveSpeed(): number {
    return this.speed + this.skillSpeedBonus;
  }

  // 実効マグネット範囲取得
  public getEffectiveMagnetRange(): number {
    return this.magnetRange + this.skillMagnetBonus;
  }
}
