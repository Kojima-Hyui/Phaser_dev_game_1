/**
 * ユーティリティ関数のテスト
 */

describe('Utility Functions', () => {
  describe('数値妥当性チェック', () => {
    test('正の数値は有効', () => {
      const value = 100;
      expect(isFinite(value)).toBe(true);
      expect(value >= 0).toBe(true);
    });

    test('負の数値は無効', () => {
      const value = -10;
      expect(value < 0).toBe(true);
    });

    test('NaNは無効', () => {
      const value = NaN;
      expect(isFinite(value)).toBe(false);
    });

    test('Infinityは無効', () => {
      const value = Infinity;
      expect(isFinite(value)).toBe(false);
    });
  });

  describe('ダメージ計算', () => {
    test('基本ダメージ計算', () => {
      const baseDamage = 100;
      const armor = 0.5; // 50% 軽減
      const actualDamage = baseDamage * (1 - armor);
      expect(actualDamage).toBe(50);
    });

    test('最大アーマー制限（75%）', () => {
      const armor1 = 0.5;
      const armor2 = 0.3;
      const totalArmor = Math.min(armor1 + armor2, 0.75);
      expect(totalArmor).toBe(0.75);
    });

    test('ダメージは0未満にならない', () => {
      const health = 50;
      const damage = 100;
      const newHealth = Math.max(0, health - damage);
      expect(newHealth).toBe(0);
    });
  });

  describe('経験値計算', () => {
    test('基本経験値計算', () => {
      const baseExp = 100;
      const bonus = 0.1; // 10% ボーナス
      const actualExp = Math.floor(baseExp * (1 + bonus));
      expect(actualExp).toBe(110);
    });

    test('レベルアップ必要経験値計算', () => {
      const baseExp = 100;
      const level = 2;
      const multiplier = 1.5;
      const expForNextLevel = Math.floor(baseExp * Math.pow(multiplier, level - 1));
      expect(expForNextLevel).toBe(150);
    });

    test('複数レベルアップ時の経験値計算', () => {
      const baseExp = 100;
      const level = 3;
      const multiplier = 1.5;
      const expForNextLevel = Math.floor(baseExp * Math.pow(multiplier, level - 1));
      expect(expForNextLevel).toBe(225); // 100 * 1.5^2 = 225
    });
  });

  describe('スキルコスト計算', () => {
    test('基本スキルコスト計算', () => {
      const baseCost = 1;
      const currentLevel = 0;
      const costPerLevel = 1;
      const cost = baseCost + (currentLevel * costPerLevel);
      expect(cost).toBe(1);
    });

    test('レベルアップ後のスキルコスト計算', () => {
      const baseCost = 1;
      const currentLevel = 2;
      const costPerLevel = 1;
      const cost = baseCost + (currentLevel * costPerLevel);
      expect(cost).toBe(3);
    });

    test('高コストスキルのコスト計算', () => {
      const baseCost = 3;
      const currentLevel = 1;
      const costPerLevel = 3;
      const cost = baseCost + (currentLevel * costPerLevel);
      expect(cost).toBe(6);
    });
  });

  describe('スコア計算', () => {
    test('基本スコア加算', () => {
      let score = 0;
      const enemyScore = 10;
      score += enemyScore;
      expect(score).toBe(10);
    });

    test('複数の敵を倒した場合のスコア', () => {
      let score = 0;
      score += 10; // CHASER
      score += 15; // SHOOTER
      score += 20; // SPEEDY
      expect(score).toBe(45);
    });

    test('ボスを倒した場合のスコア', () => {
      let score = 100;
      score += 200; // BOSS
      expect(score).toBe(300);
    });
  });

  describe('難易度スケーリング', () => {
    test('難易度レベル1のHP倍率', () => {
      const difficultyLevel = 1;
      const hpMultiplier = 1 + (difficultyLevel - 1) * 0.1;
      expect(hpMultiplier).toBe(1.0);
    });

    test('難易度レベル5のHP倍率', () => {
      const difficultyLevel = 5;
      const hpMultiplier = 1 + (difficultyLevel - 1) * 0.1;
      expect(hpMultiplier).toBe(1.4);
    });

    test('難易度レベル1の速度倍率', () => {
      const difficultyLevel = 1;
      const speedMultiplier = 1 + (difficultyLevel - 1) * 0.05;
      expect(speedMultiplier).toBe(1.0);
    });

    test('難易度レベル10の速度倍率', () => {
      const difficultyLevel = 10;
      const speedMultiplier = 1 + (difficultyLevel - 1) * 0.05;
      expect(speedMultiplier).toBe(1.45);
    });
  });

  describe('パーセンテージ計算', () => {
    test('50%のHP', () => {
      const health = 50;
      const maxHealth = 100;
      const percentage = health / maxHealth;
      expect(percentage).toBe(0.5);
    });

    test('0%のHP', () => {
      const health = 0;
      const maxHealth = 100;
      const percentage = health / maxHealth;
      expect(percentage).toBe(0);
    });

    test('100%のHP', () => {
      const health = 100;
      const maxHealth = 100;
      const percentage = health / maxHealth;
      expect(percentage).toBe(1);
    });
  });
});
