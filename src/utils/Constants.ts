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
  TANK = 'tank',         // タンク型
  BOSS = 'boss'          // ボス
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
  },
  [EnemyType.BOSS]: {
    speed: 80,
    health: 500,
    damage: 25,
    size: 48,
    color: 0xff0000,      // レッド
    score: 200
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
  LASER = 'laser',
  BEAM = 'beam',
  ROCKET_LAUNCHER = 'rocket_launcher'
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
    color: 0x00ff00,
    explosionRadius: 0
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
    color: 0xff6600,
    explosionRadius: 0
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
    color: 0x00ffff,
    explosionRadius: 0
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
    color: 0xff00ff,
    explosionRadius: 0
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
    color: 0xff0066,
    explosionRadius: 0
  },
  [WeaponType.BEAM]: {
    name: 'Beam',
    damage: 5,
    fireRate: 50,       // 超高速連射
    bulletSpeed: 900,
    bulletSize: 2,
    bulletCount: 1,
    spread: 0,
    penetration: true,  // 貫通レーザー
    color: 0x00ffaa,    // シアングリーン
    explosionRadius: 0
  },
  [WeaponType.ROCKET_LAUNCHER]: {
    name: 'Rocket Launcher',
    damage: 40,
    fireRate: 1200,     // 低速
    bulletSpeed: 350,
    bulletSize: 8,
    bulletCount: 1,
    spread: 0,
    penetration: false,
    color: 0xff4400,    // オレンジレッド
    explosionRadius: 60 // 爆発半径
  }
};

// アイテムタイプ
export enum ItemType {
  SPEED_BOOST = 'speed_boost',
  DAMAGE_UP = 'damage_up',
  MAX_HP_UP = 'max_hp_up',
  FIRE_RATE_UP = 'fire_rate_up',
  ARMOR = 'armor',
  HEALTH_REGEN = 'health_regen',
  MULTI_SHOT = 'multi_shot',
  MAGNET = 'magnet'
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
  },
  [ItemType.HEALTH_REGEN]: {
    name: 'Health Regen',
    description: 'Instantly restores HP',
    effect: 40,         // 即時HP40回復
    color: 0x00ff88,    // 明るい緑
    dropChance: 0.10
  },
  [ItemType.MULTI_SHOT]: {
    name: 'Multi Shot',
    description: 'Adds +1 bullet to all weapons',
    effect: 1,          // 弾数+1
    color: 0xff00aa,    // ピンク
    dropChance: 0.06    // レア
  },
  [ItemType.MAGNET]: {
    name: 'Magnet',
    description: 'Increases pickup range',
    effect: 100,        // 回収範囲+100px
    color: 0x6666ff,    // ブルー
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

// スキルポイント設定
export const SKILL_POINT = {
  SP_PER_LEVEL: 1,        // レベルアップごとに獲得するSP
  EXP_FOR_BONUS_SP: 500   // ボーナスSP獲得に必要な累計経験値
};

// スキルタイプ
export enum SkillType {
  // 攻撃系
  POWER_SHOT = 'power_shot',           // ダメージ増加
  RAPID_FIRE = 'rapid_fire',           // 連射速度上昇
  PIERCING_ROUNDS = 'piercing_rounds', // 貫通弾強化
  EXPLOSIVE_ROUNDS = 'explosive_rounds', // 爆発範囲拡大
  MULTI_SHOT = 'multi_shot',           // 追加弾数

  // 防御系
  VITALITY = 'vitality',               // 最大HP増加
  REGENERATION = 'regeneration',       // HP自動回復
  ARMOR_PLATING = 'armor_plating',     // ダメージ軽減
  EVASION = 'evasion',                 // 回避率

  // ユーティリティ系
  SPEED_BOOST = 'speed_boost',         // 移動速度上昇
  MAGNETISM = 'magnetism',             // アイテム回収範囲
  LUCKY = 'lucky',                     // ドロップ率上昇
  EXP_BOOST = 'exp_boost'              // 経験値増加
}

// スキルカテゴリ
export enum SkillCategory {
  OFFENSE = 'offense',
  DEFENSE = 'defense',
  UTILITY = 'utility'
}

// スキル設定
export const SKILLS: {
  [key in SkillType]: {
    name: string;
    description: string;
    category: SkillCategory;
    maxLevel: number;
    baseCost: number;        // 基本SPコスト
    costPerLevel: number;    // レベルごとの追加コスト
    effectPerLevel: number;  // レベルごとの効果量
    color: number;
  }
} = {
  // 攻撃系スキル
  [SkillType.POWER_SHOT]: {
    name: 'Power Shot',
    description: 'Increases weapon damage by 10% per level',
    category: SkillCategory.OFFENSE,
    maxLevel: 5,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 0.10,  // +10% per level
    color: 0xff4444
  },
  [SkillType.RAPID_FIRE]: {
    name: 'Rapid Fire',
    description: 'Increases fire rate by 8% per level',
    category: SkillCategory.OFFENSE,
    maxLevel: 5,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 0.08,  // +8% per level
    color: 0xff8800
  },
  [SkillType.PIERCING_ROUNDS]: {
    name: 'Piercing Rounds',
    description: 'Adds +1 penetration hit per level',
    category: SkillCategory.OFFENSE,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 1,     // +1 hit per level
    color: 0xaa00ff
  },
  [SkillType.EXPLOSIVE_ROUNDS]: {
    name: 'Explosive Rounds',
    description: 'Increases explosion radius by 15% per level',
    category: SkillCategory.OFFENSE,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 0.15,  // +15% per level
    color: 0xff4400
  },
  [SkillType.MULTI_SHOT]: {
    name: 'Multi Shot',
    description: 'Adds +1 bullet per level',
    category: SkillCategory.OFFENSE,
    maxLevel: 3,
    baseCost: 3,
    costPerLevel: 3,
    effectPerLevel: 1,     // +1 bullet per level
    color: 0xff00aa
  },

  // 防御系スキル
  [SkillType.VITALITY]: {
    name: 'Vitality',
    description: 'Increases max HP by 20 per level',
    category: SkillCategory.DEFENSE,
    maxLevel: 5,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 20,    // +20 HP per level
    color: 0x00ff00
  },
  [SkillType.REGENERATION]: {
    name: 'Regeneration',
    description: 'Recovers 1 HP per second per level',
    category: SkillCategory.DEFENSE,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 1,     // +1 HP/s per level
    color: 0x00ff88
  },
  [SkillType.ARMOR_PLATING]: {
    name: 'Armor Plating',
    description: 'Reduces damage taken by 5% per level',
    category: SkillCategory.DEFENSE,
    maxLevel: 5,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 0.05,  // +5% reduction per level
    color: 0x888888
  },
  [SkillType.EVASION]: {
    name: 'Evasion',
    description: '5% chance to dodge attacks per level',
    category: SkillCategory.DEFENSE,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 0.05,  // +5% dodge per level
    color: 0x00aaff
  },

  // ユーティリティ系スキル
  [SkillType.SPEED_BOOST]: {
    name: 'Speed Boost',
    description: 'Increases movement speed by 15 per level',
    category: SkillCategory.UTILITY,
    maxLevel: 5,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 15,    // +15 speed per level
    color: 0xffff00
  },
  [SkillType.MAGNETISM]: {
    name: 'Magnetism',
    description: 'Increases pickup range by 50px per level',
    category: SkillCategory.UTILITY,
    maxLevel: 3,
    baseCost: 1,
    costPerLevel: 1,
    effectPerLevel: 50,    // +50px per level
    color: 0x6666ff
  },
  [SkillType.LUCKY]: {
    name: 'Lucky',
    description: 'Increases item drop rate by 5% per level',
    category: SkillCategory.UTILITY,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 0.05,  // +5% per level
    color: 0xffaa00
  },
  [SkillType.EXP_BOOST]: {
    name: 'EXP Boost',
    description: 'Increases EXP gain by 10% per level',
    category: SkillCategory.UTILITY,
    maxLevel: 3,
    baseCost: 2,
    costPerLevel: 2,
    effectPerLevel: 0.10,  // +10% per level
    color: 0xaa00ff
  }
};
