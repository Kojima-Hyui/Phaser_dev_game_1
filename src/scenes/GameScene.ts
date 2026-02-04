import Phaser from 'phaser';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Boss } from '@/entities/Boss';
import { Bullet } from '@/entities/Bullet';
import { EnemyBullet } from '@/entities/EnemyBullet';
import { Item } from '@/entities/Item';
import { Credit } from '@/entities/Credit';
import { MapGenerator, MapPattern } from '@/managers/MapGenerator';
import { GAME_WIDTH, GAME_HEIGHT, GAME, ENEMY, MAP, EnemyType, WeaponType, ItemType, ITEMS, ENEMY_TYPES } from '@/utils/Constants';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private score: number = 0;
  private mapGenerator!: MapGenerator;
  private walls!: Phaser.GameObjects.Group;
  private items!: Phaser.GameObjects.Group;
  private credits!: Phaser.GameObjects.Group;
  private currentCredits: number = 0;
  private totalCredits: number = 0;
  private currentBoss: Boss | null = null;
  private lastBossSpawnScore: number = 0;
  private difficultyLevel: number = 1;
  private lastDifficultyScore: number = 0;
  private isSkillMenuOpen: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // ワールドバウンドをマップサイズに設定
    this.physics.world.setBounds(0, 0, MAP.WIDTH, MAP.HEIGHT);

    // デバッグモード設定
    if (GAME.DEBUG_MODE) {
      this.physics.world.drawDebug = true;
    }

    // プレイヤーをマップ中央に配置
    this.player = new Player(this, MAP.WIDTH / 2, MAP.HEIGHT / 2);

    // マップ生成
    this.mapGenerator = new MapGenerator(this);
    this.walls = this.mapGenerator.generateMap(this.player.x, this.player.y);

    // カメラ設定（プレイヤーを追従）
    this.cameras.main.setBounds(0, 0, MAP.WIDTH, MAP.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 敵グループの作成
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    // アイテムグループの作成
    this.items = this.add.group({
      classType: Item,
      runChildUpdate: false
    });

    // クレジットグループの作成
    this.credits = this.add.group({
      classType: Credit,
      runChildUpdate: false
    });

    // 永続化されたクレジットを読み込み
    this.loadTotalCredits();

    // 初期の敵を配置
    this.spawnEnemies(GAME.INITIAL_ENEMY_COUNT);

    // 入力設定
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // スペースキーまたはマウスクリックで射撃
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.player.shoot(this.input.activePointer);
    });

    this.input.on('pointerdown', () => {
      this.player.shoot(this.input.activePointer);
    });

    // 武器切り替えキー（1-7）
    this.input.keyboard!.on('keydown-ONE', () => this.player.switchWeapon(WeaponType.PISTOL));
    this.input.keyboard!.on('keydown-TWO', () => this.player.switchWeapon(WeaponType.SHOTGUN));
    this.input.keyboard!.on('keydown-THREE', () => this.player.switchWeapon(WeaponType.RIFLE));
    this.input.keyboard!.on('keydown-FOUR', () => this.player.switchWeapon(WeaponType.SNIPER));
    this.input.keyboard!.on('keydown-FIVE', () => this.player.switchWeapon(WeaponType.LASER));
    this.input.keyboard!.on('keydown-SIX', () => this.player.switchWeapon(WeaponType.BEAM));
    this.input.keyboard!.on('keydown-SEVEN', () => this.player.switchWeapon(WeaponType.ROCKET_LAUNCHER));

    // テスト用：全武器をアンロック（後で削除）
    this.player.unlockWeapon(WeaponType.SHOTGUN);
    this.player.unlockWeapon(WeaponType.RIFLE);
    this.player.unlockWeapon(WeaponType.SNIPER);
    this.player.unlockWeapon(WeaponType.LASER);
    this.player.unlockWeapon(WeaponType.BEAM);
    this.player.unlockWeapon(WeaponType.ROCKET_LAUNCHER);

    // 衝突判定
    this.setupCollisions();

    // スコア表示（UISceneに送信）
    this.events.on('updateScore', this.updateScore, this);

    // TABキーでスキルメニュー開閉
    this.input.keyboard!.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.toggleSkillMenu();
    });

    // スキルメニューが閉じられた時のイベント
    this.events.on('skillMenuClosed', () => {
      this.isSkillMenuOpen = false;
      this.physics.resume();
    });
  }

  update(_time: number, delta: number): void {
    // スキルメニューが開いている場合は更新しない
    if (this.isSkillMenuOpen) {
      return;
    }

    // プレイヤーの更新
    this.player.update(this.cursors, this.wasd);
    this.player.aimAndRotate(this.input.activePointer);

    // HP自動回復（Regenerationスキル）
    this.player.updateRegen(delta);

    // 敵の数を維持
    if (this.enemies.getLength() < GAME.INITIAL_ENEMY_COUNT && !this.currentBoss) {
      this.spawnEnemies(1);
    }

    // ボスの更新
    if (this.currentBoss && this.currentBoss.active) {
      this.currentBoss.update();
      this.events.emit('updateBossHealth', {
        health: this.currentBoss.health,
        maxHealth: this.currentBoss.maxHealth
      });
    }

    // ボススポーンチェック（スコア500点ごと）
    if (this.score >= this.lastBossSpawnScore + 500 && !this.currentBoss) {
      this.spawnBoss();
      this.lastBossSpawnScore = this.score;
    }

    // 難易度進行チェック（スコア200点ごと）
    if (this.score >= this.lastDifficultyScore + 200) {
      this.increaseDifficulty();
      this.lastDifficultyScore = this.score;
    }

    // マグネット効果：アイテムとクレジットを引き寄せる
    this.applyMagnetEffect();

    // UIシーンにプレイヤー情報を送信
    this.events.emit('updateUI', {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      score: this.score,
      level: this.player.level,
      exp: this.player.exp,
      expToNextLevel: this.player.expToNextLevel,
      currentWeapon: this.player.getCurrentWeapon().config.name,
      credits: this.currentCredits,
      skillPoints: this.player.skillPoints,
      totalCredits: this.totalCredits
    });
  }

  private applyMagnetEffect(): void {
    const effectiveMagnetRange = this.player.getEffectiveMagnetRange();
    if (effectiveMagnetRange <= 0) return;

    const magnetRange = 50 + effectiveMagnetRange; // ベース50px + マグネットボーナス

    // アイテムを引き寄せる
    this.items.getChildren().forEach((itemObj) => {
      const item = itemObj as Item;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (distance < magnetRange && distance > 10) {
        const angle = Phaser.Math.Angle.Between(item.x, item.y, this.player.x, this.player.y);
        item.x += Math.cos(angle) * 5;
        item.y += Math.sin(angle) * 5;
      }
    });

    // クレジットを引き寄せる
    this.credits.getChildren().forEach((creditObj) => {
      const credit = creditObj as Credit;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, credit.x, credit.y);
      if (distance < magnetRange && distance > 10) {
        const angle = Phaser.Math.Angle.Between(credit.x, credit.y, this.player.x, this.player.y);
        credit.x += Math.cos(angle) * 5;
        credit.y += Math.sin(angle) * 5;
      }
    });
  }

  private setupCollisions(): void {
    // プレイヤーと壁の衝突
    this.physics.add.collider(this.player, this.walls);

    // 敵と壁の衝突
    this.physics.add.collider(this.enemies, this.walls);

    // 弾丸と壁の衝突（弾丸は破壊される）
    this.physics.add.collider(this.player.getBullets(), this.walls, (bullet) => {
      bullet.destroy();
    });

    // 弾丸と敵の衝突
    this.physics.add.overlap(
      this.player.getBullets(),
      this.enemies,
      this.bulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // プレイヤーと敵の衝突
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // プレイヤーとアイテムの衝突
    this.physics.add.overlap(
      this.player,
      this.items,
      this.playerPickupItem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // プレイヤーとクレジットの衝突
    this.physics.add.overlap(
      this.player,
      this.credits,
      this.playerPickupCredit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private setupEnemyBulletCollisions(enemy: Enemy): void {
    const enemyBullets = enemy.getBullets();
    if (!enemyBullets) return;

    // 敵の弾丸とプレイヤーの衝突
    this.physics.add.overlap(
      this.player,
      enemyBullets,
      this.enemyBulletHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // 敵の弾丸と壁の衝突
    this.physics.add.collider(enemyBullets, this.walls, (bullet) => {
      bullet.destroy();
    });
  }

  private bulletHitEnemy(
    bulletObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void {
    const bullet = bulletObj as Bullet;
    const enemy = enemyObj as Enemy;

    // ヒットエフェクト
    this.createHitEffect(enemy.x, enemy.y);

    // ダメージ数値表示
    this.showDamageNumber(enemy.x, enemy.y, bullet.damage);

    enemy.takeDamage(bullet.damage);

    // 爆発処理（ロケットランチャー）
    if (bullet.explosionRadius > 0) {
      this.createExplosion(bullet.x, bullet.y, bullet.explosionRadius, bullet.damage);
    }

    // 弾丸のヒット処理（貫通弾でない場合は破壊）
    bullet.onHit();

    // 敵を倒したらスコアとEXP加算（タイプに応じて）
    if (enemy.health <= 0) {
      this.score += enemy.scoreValue;
      this.player.gainExp(enemy.scoreValue); // スコアと同じ量のEXPを獲得

      // 死亡エフェクト
      this.createDeathEffect(enemy.x, enemy.y, enemy.enemyType);

      // アイテムドロップ判定
      this.tryDropItem(enemy.x, enemy.y);

      // クレジットドロップ判定
      this.tryDropCredit(enemy.x, enemy.y);
    }
  }

  private createHitEffect(x: number, y: number): void {
    // 白い火花エフェクト
    const spark = this.add.graphics();
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(0, 0, 5);
    spark.x = x;
    spark.y = y;

    this.tweens.add({
      targets: spark,
      scale: 2,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        spark.destroy();
      }
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const damageText = this.add.text(x, y - 20, Math.floor(damage).toString(), {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    damageText.setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        damageText.destroy();
      }
    });
  }

  private createDeathEffect(x: number, y: number, enemyType: EnemyType): void {
    // 8方向パーティクル爆発
    const particleCount = 8;
    const color = ENEMY_TYPES[enemyType]?.color || 0xff0066;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 4);
      particle.x = x;
      particle.y = y;

      const distance = 50;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  private createExplosion(x: number, y: number, radius: number, damage: number): void {
    // 爆発エフェクト
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff4400, 0.5);
    explosion.fillCircle(0, 0, radius);
    explosion.lineStyle(3, 0xffff00, 1);
    explosion.strokeCircle(0, 0, radius);
    explosion.x = x;
    explosion.y = y;

    this.tweens.add({
      targets: explosion,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });

    // 範囲内の敵にダメージ
    this.enemies.getChildren().forEach((enemyObj) => {
      const enemy = enemyObj as Enemy;
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance < radius) {
        // 距離に応じてダメージ減衰
        const damageMultiplier = 1 - (distance / radius) * 0.5;
        enemy.takeDamage(damage * damageMultiplier);
        this.showDamageNumber(enemy.x, enemy.y, damage * damageMultiplier);

        if (enemy.health <= 0) {
          this.score += enemy.scoreValue;
          this.player.gainExp(enemy.scoreValue);
          this.createDeathEffect(enemy.x, enemy.y, enemy.enemyType);
          this.tryDropItem(enemy.x, enemy.y);
          this.tryDropCredit(enemy.x, enemy.y);
        }
      }
    });

    // ボスにもダメージ
    if (this.currentBoss && this.currentBoss.active) {
      const distance = Phaser.Math.Distance.Between(x, y, this.currentBoss.x, this.currentBoss.y);
      if (distance < radius) {
        const damageMultiplier = 1 - (distance / radius) * 0.5;
        this.currentBoss.takeDamage(damage * damageMultiplier);
        this.showDamageNumber(this.currentBoss.x, this.currentBoss.y, damage * damageMultiplier);
      }
    }

    // 画面シェイク
    this.cameras.main.shake(100, 0.005);
  }

  private tryDropItem(x: number, y: number): void {
    // ランダムでアイテムをドロップ（ドロップ率ボーナス適用）
    const allItems = Object.values(ItemType);
    const dropBonus = this.player.getDropBonus();

    for (const itemType of allItems) {
      const config = ITEMS[itemType];
      const adjustedDropChance = config.dropChance * (1 + dropBonus);
      if (Math.random() < adjustedDropChance) {
        const item = new Item(this, x, y, itemType);
        this.items.add(item);
        break; // 1回に1つのアイテムのみドロップ
      }
    }
  }

  private playerPickupItem(
    _playerObj: Phaser.GameObjects.GameObject,
    itemObj: Phaser.GameObjects.GameObject
  ): void {
    const item = itemObj as Item;

    this.player.pickupItem(item.itemType);

    // ピックアップエフェクト
    this.tweens.add({
      targets: item,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        item.destroy();
      }
    });
  }

  private enemyBulletHitPlayer(
    _playerObj: Phaser.GameObjects.GameObject,
    bulletObj: Phaser.GameObjects.GameObject
  ): void {
    const bullet = bulletObj as EnemyBullet;

    this.player.takeDamage(bullet.damage);
    bullet.destroy();

    // プレイヤーが死んだらゲームオーバー
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private playerHitEnemy(
    _playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ): void {
    const enemy = enemyObj as Enemy;

    this.player.takeDamage(enemy.getDamage());
    enemy.destroy();

    // プレイヤーが死んだらゲームオーバー
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private spawnEnemies(count: number): void {
    const difficulty = this.getDifficultyMultiplier();

    for (let i = 0; i < count; i++) {
      // プレイヤーから離れた位置にスポーン
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = ENEMY.SPAWN_DISTANCE;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;

      // マップ内に収まるように調整
      const clampedX = Phaser.Math.Clamp(x, 50, MAP.WIDTH - 50);
      const clampedY = Phaser.Math.Clamp(y, 50, MAP.HEIGHT - 50);

      // ランダムに敵タイプを選択
      const types = [EnemyType.CHASER, EnemyType.SHOOTER, EnemyType.SPEEDY, EnemyType.TANK];
      const randomType = Phaser.Utils.Array.GetRandom(types);

      const enemy = new Enemy(this, clampedX, clampedY, this.player, randomType);

      // 難易度に応じてステータス調整
      enemy.health *= difficulty.hpMultiplier;
      enemy.maxHealth *= difficulty.hpMultiplier;

      this.enemies.add(enemy);

      // Shooterタイプの場合、弾丸の衝突判定を設定
      if (randomType === EnemyType.SHOOTER) {
        this.setupEnemyBulletCollisions(enemy);
      }
    }
  }

  private tryDropCredit(x: number, y: number): void {
    if (Math.random() < GAME.CREDIT_DROP_CHANCE) {
      const credit = new Credit(this, x, y);
      this.credits.add(credit);
    }
  }

  private playerPickupCredit(
    _playerObj: Phaser.GameObjects.GameObject,
    creditObj: Phaser.GameObjects.GameObject
  ): void {
    const credit = creditObj as Credit;

    this.currentCredits += credit.value;
    this.totalCredits += credit.value;
    this.saveTotalCredits();

    // ピックアップエフェクト
    this.tweens.add({
      targets: credit,
      y: credit.y - 30,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        credit.destroy();
      }
    });
  }

  private loadTotalCredits(): void {
    const saved = localStorage.getItem('totalCredits');
    this.totalCredits = saved ? parseInt(saved) : 0;
  }

  private saveTotalCredits(): void {
    localStorage.setItem('totalCredits', this.totalCredits.toString());
  }

  private updateScore(newScore: number): void {
    this.score = newScore;
  }

  private spawnBoss(): void {
    // ボス戦用にアリーナパターンでマップを再生成
    this.walls = this.mapGenerator.generateMap(this.player.x, this.player.y, MapPattern.ARENA);

    // 衝突判定を再設定
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.player.getBullets(), this.walls, (bullet) => {
      bullet.destroy();
    });

    // ボスをスポーン
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = ENEMY.SPAWN_DISTANCE;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * distance, 100, MAP.WIDTH - 100);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * distance, 100, MAP.HEIGHT - 100);

    this.currentBoss = new Boss(this, x, y, this.player);

    // ボスの弾丸衝突判定
    this.setupBossBulletCollisions();

    // プレイヤーの弾丸とボスの衝突判定
    this.physics.add.overlap(
      this.player.getBullets(),
      this.currentBoss,
      this.bulletHitBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // プレイヤーとボスの衝突判定
    this.physics.add.overlap(
      this.player,
      this.currentBoss,
      this.playerHitBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // ボスと壁の衝突
    this.physics.add.collider(this.currentBoss, this.walls);

    // UIにボススポーンを通知
    this.events.emit('bossSpawned');

    // 画面シェイク
    this.cameras.main.shake(500, 0.01);
  }

  private setupBossBulletCollisions(): void {
    if (!this.currentBoss) return;

    const bossBullets = this.currentBoss.getBullets();

    // ボスの弾丸とプレイヤーの衝突
    this.physics.add.overlap(
      this.player,
      bossBullets,
      this.enemyBulletHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // ボスの弾丸と壁の衝突
    this.physics.add.collider(bossBullets, this.walls, (bullet) => {
      bullet.destroy();
    });
  }

  private bulletHitBoss(
    bulletObj: Phaser.GameObjects.GameObject,
    _bossObj: Phaser.GameObjects.GameObject
  ): void {
    const bullet = bulletObj as Bullet;

    if (!this.currentBoss || !this.currentBoss.active) return;

    // ヒットエフェクト
    this.createHitEffect(this.currentBoss.x, this.currentBoss.y);

    // ダメージ数値表示
    this.showDamageNumber(this.currentBoss.x, this.currentBoss.y, bullet.damage);

    this.currentBoss.takeDamage(bullet.damage);

    // 弾丸のヒット処理
    bullet.onHit();

    // ボスを倒した場合
    if (this.currentBoss.health <= 0) {
      this.onBossDefeated();
    }
  }

  private playerHitBoss(
    _playerObj: Phaser.GameObjects.GameObject,
    _bossObj: Phaser.GameObjects.GameObject
  ): void {
    if (!this.currentBoss || !this.currentBoss.active) return;

    this.player.takeDamage(this.currentBoss.getDamage());

    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private onBossDefeated(): void {
    if (!this.currentBoss) return;

    // スコアとEXP加算
    this.score += this.currentBoss.scoreValue;
    this.player.gainExp(this.currentBoss.scoreValue);

    // 大きな死亡エフェクト
    this.createBossDeathEffect(this.currentBoss.x, this.currentBoss.y);

    // 大量のアイテムとクレジットをドロップ
    for (let i = 0; i < 5; i++) {
      const offsetX = Phaser.Math.Between(-50, 50);
      const offsetY = Phaser.Math.Between(-50, 50);
      this.tryDropItem(this.currentBoss.x + offsetX, this.currentBoss.y + offsetY);
      this.tryDropCredit(this.currentBoss.x + offsetX, this.currentBoss.y + offsetY);
    }

    // UIに通知
    this.events.emit('bossDefeated');

    this.currentBoss = null;
  }

  private createBossDeathEffect(x: number, y: number): void {
    // 大きな爆発エフェクト（16方向）
    const particleCount = 16;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const particle = this.add.graphics();
      particle.fillStyle(0xff0000, 1);
      particle.fillCircle(0, 0, 8);
      particle.x = x;
      particle.y = y;

      const distance = 100;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 画面シェイク
    this.cameras.main.shake(300, 0.02);
  }

  private increaseDifficulty(): void {
    this.difficultyLevel++;
    console.log(`Difficulty increased to level ${this.difficultyLevel}`);

    // 新しい敵はより強くなる（既存の敵は変更しない）
    // 次回スポーン時に難易度が適用される
  }

  public getDifficultyMultiplier(): { hpMultiplier: number; speedMultiplier: number } {
    return {
      hpMultiplier: 1 + (this.difficultyLevel - 1) * 0.1,    // +10% per level
      speedMultiplier: 1 + (this.difficultyLevel - 1) * 0.05  // +5% per level
    };
  }

  private gameOver(): void {
    console.log('Game Over! Final Score:', this.score);

    // ゲームを一時停止
    this.physics.pause();

    // ゲームオーバーテキストを表示（画面中央に固定）
    const gameOverText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      'GAME OVER\nPress R to Restart',
      {
        fontSize: '48px',
        color: '#ff0066',
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0); // カメラに固定

    // スコア表示
    const scoreText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 80,
      `Score: ${this.score}`,
      {
        fontSize: '32px',
        color: '#00ffff',
        align: 'center'
      }
    );
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0); // カメラに固定

    // Rキーでリスタート
    this.input.keyboard!.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  private toggleSkillMenu(): void {
    if (this.isSkillMenuOpen) {
      // メニューを閉じる
      this.scene.stop('SkillMenuScene');
      this.isSkillMenuOpen = false;
      this.physics.resume();
    } else {
      // メニューを開く
      this.isSkillMenuOpen = true;
      this.physics.pause();
      this.scene.launch('SkillMenuScene', { player: this.player });
    }
  }
}
