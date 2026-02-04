// ゲーム定数
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// カラーパレット（サイバーパンク風）
export const COLORS = {
  BACKGROUND: 0x0a0a14,
  PLAYER: 0x00ffff,      // シアン
  ENEMY: 0xff0066,       // マゼンタ
  BULLET: 0x00ff00,      // グリーン
  UI_TEXT: 0x00ffff,
  HEALTH_BAR: 0xff0066,
  HEALTH_BAR_BG: 0x333333,
  WALL: 0x4a4a5a,        // グレー
  WALL_OUTLINE: 0x8a8aaa
};

// プレイヤー設定
export const PLAYER = {
  SPEED: 250,
  SIZE: 20,
  MAX_HEALTH: 100,
  SHOOT_COOLDOWN: 200,  // ミリ秒
  INITIAL_LEVEL: 1,
  EXP_TO_NEXT_LEVEL_BASE: 100,  // レベル1→2に必要な経験値
  EXP_MULTIPLIER: 1.5,           // レベルごとの必要経験値の倍率
  LEVEL_UP_HP_GAIN: 20,          // レベルアップ時のHP増加量
  LEVEL_UP_DAMAGE_MULTIPLIER: 0.1,  // レベルアップ時の攻撃力増加率
  LEVEL_UP_SPEED_GAIN: 10        // レベルアップ時の速度増加量
};

// 敵設定
export const ENEMY = {
  SPEED: 100,
  SIZE: 16,
  HEALTH: 30,
  DAMAGE: 10,
  SPAWN_DISTANCE: 400,  // プレイヤーから離れた場所にスポーン
  SHOOT_RANGE: 350,     // 射撃型の攻撃範囲
  SHOOT_COOLDOWN: 1500  // 射撃型のクールダウン（ミリ秒）
};

// 敵タイプ別設定
export enum EnemyType {
  CHASER = 'chaser',     // 追跡型
  SHOOTER = 'shooter',   // 遠距離攻撃型
  SPEEDY = 'speedy',     // 高速型
  TANK = 'tank'          // タンク型
}

export const ENEMY_TYPES = {
  [EnemyType.CHASER]: {
    speed: 100,
    health: 30,
    damage: 10,
    size: 16,
    color: 0xff0066,      // マゼンタ
    score: 10
  },
  [EnemyType.SHOOTER]: {
    speed: 60,
    health: 25,
    damage: 8,
    size: 14,
    color: 0xff6600,      // オレンジ
    score: 15
  },
  [EnemyType.SPEEDY]: {
    speed: 180,
    health: 15,
    damage: 5,
    size: 12,
    color: 0xffff00,      // イエロー
    score: 20
  },
  [EnemyType.TANK]: {
    speed: 50,
    health: 80,
    damage: 15,
    size: 24,
    color: 0xff00ff,      // パープル
    score: 30
  }
};

// 弾丸設定
export const BULLET = {
  SPEED: 500,
  SIZE: 4,
  DAMAGE: 15,
  LIFETIME: 2000  // ミリ秒
};

// 武器タイプ
export enum WeaponType {
  PISTOL = 'pistol',
  SHOTGUN = 'shotgun',
  RIFLE = 'rifle',
  SNIPER = 'sniper',
  LASER = 'laser'
}

// 武器設定
export const WEAPONS = {
  [WeaponType.PISTOL]: {
    name: 'Pistol',
    damage: 15,
    fireRate: 200,      // ミリ秒
    bulletSpeed: 500,
    bulletSize: 4,
    bulletCount: 1,     // 一度に撃つ弾の数
    spread: 0,          // 散弾の広がり角度（ラジアン）
    penetration: false, // 貫通
    color: 0x00ff00
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    damage: 8,
    fireRate: 600,
    bulletSpeed: 400,
    bulletSize: 3,
    bulletCount: 5,     // 5発同時発射
    spread: 0.3,        // 広い散弾
    penetration: false,
    color: 0xff6600
  },
  [WeaponType.RIFLE]: {
    name: 'Rifle',
    damage: 12,
    fireRate: 100,      // 高速連射
    bulletSpeed: 600,
    bulletSize: 3,
    bulletCount: 1,
    spread: 0,
    penetration: false,
    color: 0x00ffff
  },
  [WeaponType.SNIPER]: {
    name: 'Sniper',
    damage: 50,
    fireRate: 1000,     // 低速射撃
    bulletSpeed: 800,
    bulletSize: 5,
    bulletCount: 1,
    spread: 0,
    penetration: true,  // 貫通弾
    color: 0xff00ff
  },
  [WeaponType.LASER]: {
    name: 'Laser',
    damage: 20,
    fireRate: 150,
    bulletSpeed: 700,
    bulletSize: 4,
    bulletCount: 1,
    spread: 0,
    penetration: true,  // 貫通弾
    color: 0xff0066
  }
};

// アイテムタイプ
export enum ItemType {
  SPEED_BOOST = 'speed_boost',
  DAMAGE_UP = 'damage_up',
  MAX_HP_UP = 'max_hp_up',
  FIRE_RATE_UP = 'fire_rate_up',
  ARMOR = 'armor'
}

// アイテム設定
export const ITEMS = {
  [ItemType.SPEED_BOOST]: {
    name: 'Speed Boost',
    description: 'Increases movement speed',
    effect: 30,         // 移動速度 +30
    color: 0xffff00,
    dropChance: 0.15    // 15%のドロップ率
  },
  [ItemType.DAMAGE_UP]: {
    name: 'Damage Up',
    description: 'Increases weapon damage',
    effect: 0.2,        // ダメージ +20%
    color: 0xff0066,
    dropChance: 0.15
  },
  [ItemType.MAX_HP_UP]: {
    name: 'Max HP Up',
    description: 'Increases maximum health',
    effect: 30,         // 最大HP +30
    color: 0x00ff00,
    dropChance: 0.12
  },
  [ItemType.FIRE_RATE_UP]: {
    name: 'Fire Rate Up',
    description: 'Increases fire rate',
    effect: 0.15,       // 連射速度 +15%
    color: 0x00ffff,
    dropChance: 0.10
  },
  [ItemType.ARMOR]: {
    name: 'Armor',
    description: 'Reduces damage taken',
    effect: 0.1,        // ダメージ軽減 10%
    color: 0xaaaaaa,
    dropChance: 0.08
  }
};

// ゲーム設定
export const GAME = {
  INITIAL_ENEMY_COUNT: 8,   // 初期敵数を増加
  MAX_ENEMIES: 25,          // 最大敵数を増加
  DEBUG_MODE: false,        // デバッグモード（trueにすると衝突ボックスが表示される）
  CREDIT_DROP_CHANCE: 0.3   // 30%でクレジットドロップ
};

// 通貨設定
export const CURRENCY = {
  CREDIT_VALUE: 5,          // クレジット1つの価値
  CREDIT_COLOR: 0xffff00    // ゴールド
};

// マップ設定
export const MAP = {
  WIDTH: 2400,           // マップの幅（画面より大きい）
  HEIGHT: 1600,          // マップの高さ（画面より大きい）
  WALL_COUNT: 30,        // 障害物の数
  WALL_MIN_SIZE: 40,     // 障害物の最小サイズ
  WALL_MAX_SIZE: 120,    // 障害物の最大サイズ
  SAFE_ZONE_RADIUS: 300  // プレイヤー初期位置周辺の安全地帯
};
