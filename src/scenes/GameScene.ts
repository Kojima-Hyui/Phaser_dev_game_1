import Phaser from 'phaser';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Bullet } from '@/entities/Bullet';
import { EnemyBullet } from '@/entities/EnemyBullet';
import { Item } from '@/entities/Item';
import { Credit } from '@/entities/Credit';
import { MapGenerator } from '@/managers/MapGenerator';
import { GAME_WIDTH, GAME_HEIGHT, GAME, ENEMY, MAP, EnemyType, WeaponType, ItemType, ITEMS } from '@/utils/Constants';

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

    // 武器切り替えキー（1-5）
    this.input.keyboard!.on('keydown-ONE', () => this.player.switchWeapon(WeaponType.PISTOL));
    this.input.keyboard!.on('keydown-TWO', () => this.player.switchWeapon(WeaponType.SHOTGUN));
    this.input.keyboard!.on('keydown-THREE', () => this.player.switchWeapon(WeaponType.RIFLE));
    this.input.keyboard!.on('keydown-FOUR', () => this.player.switchWeapon(WeaponType.SNIPER));
    this.input.keyboard!.on('keydown-FIVE', () => this.player.switchWeapon(WeaponType.LASER));

    // テスト用：全武器をアンロック（後で削除）
    this.player.unlockWeapon(WeaponType.SHOTGUN);
    this.player.unlockWeapon(WeaponType.RIFLE);
    this.player.unlockWeapon(WeaponType.SNIPER);
    this.player.unlockWeapon(WeaponType.LASER);

    // 衝突判定
    this.setupCollisions();

    // スコア表示（UISceneに送信）
    this.events.on('updateScore', this.updateScore, this);
  }

  update(): void {
    // プレイヤーの更新
    this.player.update(this.cursors, this.wasd);
    this.player.aimAndRotate(this.input.activePointer);

    // 敵の数を維持
    if (this.enemies.getLength() < GAME.INITIAL_ENEMY_COUNT) {
      this.spawnEnemies(1);
    }

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
      totalCredits: this.totalCredits
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

    enemy.takeDamage(bullet.damage);

    // 弾丸のヒット処理（貫通弾でない場合は破壊）
    bullet.onHit();

    // 敵を倒したらスコアとEXP加算（タイプに応じて）
    if (enemy.health <= 0) {
      this.score += enemy.scoreValue;
      this.player.gainExp(enemy.scoreValue); // スコアと同じ量のEXPを獲得

      // アイテムドロップ判定
      this.tryDropItem(enemy.x, enemy.y);

      // クレジットドロップ判定
      this.tryDropCredit(enemy.x, enemy.y);
    }
  }

  private tryDropItem(x: number, y: number): void {
    // ランダムでアイテムをドロップ
    const allItems = Object.values(ItemType);

    for (const itemType of allItems) {
      const config = ITEMS[itemType];
      if (Math.random() < config.dropChance) {
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
}
