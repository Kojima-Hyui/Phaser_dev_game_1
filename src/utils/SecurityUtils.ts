/**
 * セキュリティユーティリティ
 * localStorageに保存するデータの整合性を保証するためのチェックサム機能を提供
 */

/**
 * 簡易ハッシュ関数（djb2アルゴリズム）
 * @param str ハッシュ化する文字列
 * @returns ハッシュ値
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return hash >>> 0; // 符号なし32ビット整数に変換
}

/**
 * チェックサム付きデータ
 */
interface ChecksumData {
  value: string;
  checksum: string;
  timestamp: number;
}

/**
 * データのチェックサムを計算
 * @param value データ値
 * @param secret シークレットキー（オプション）
 * @returns チェックサム
 */
function calculateChecksum(value: string, secret: string = 'cyberpunk-shooter-2026'): string {
  const combined = value + secret;
  const hash = simpleHash(combined);
  return hash.toString(36); // 36進数で文字列化（コンパクト）
}

/**
 * チェックサム付きでlocalStorageにデータを保存
 * @param key 保存キー
 * @param value 保存する値
 * @returns 保存に成功したかどうか
 */
export function saveSecure(key: string, value: string): boolean {
  try {
    const checksum = calculateChecksum(value);
    const data: ChecksumData = {
      value,
      checksum,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save secure data:', error);
    return false;
  }
}

/**
 * チェックサムを検証してlocalStorageからデータを読み込み
 * @param key 読み込みキー
 * @returns 検証に成功した場合はデータ値、失敗した場合はnull
 */
export function loadSecure(key: string): string | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const data: ChecksumData = JSON.parse(stored);

    // データ構造の検証
    if (!data.value || !data.checksum || !data.timestamp) {
      console.warn('Invalid data structure in localStorage');
      return null;
    }

    // チェックサムの検証
    const expectedChecksum = calculateChecksum(data.value);
    if (data.checksum !== expectedChecksum) {
      console.error('Checksum mismatch! Data may have been tampered with.');
      // 改ざんされたデータを削除
      localStorage.removeItem(key);
      return null;
    }

    // タイムスタンプの検証（オプション: 古すぎるデータを無効化）
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1年
    if (Date.now() - data.timestamp > maxAge) {
      console.warn('Data is too old, removing');
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch (error) {
    console.error('Failed to load secure data:', error);
    return null;
  }
}

/**
 * 数値を安全に保存
 * @param key 保存キー
 * @param value 保存する数値
 * @returns 保存に成功したかどうか
 */
export function saveSecureNumber(key: string, value: number): boolean {
  if (!isFinite(value) || value < 0) {
    console.warn('Invalid number value:', value);
    return false;
  }
  return saveSecure(key, value.toString());
}

/**
 * 数値を安全に読み込み
 * @param key 読み込みキー
 * @param defaultValue デフォルト値
 * @returns 読み込んだ数値、または検証失敗時はデフォルト値
 */
export function loadSecureNumber(key: string, defaultValue: number = 0): number {
  const value = loadSecure(key);
  if (value === null) {
    return defaultValue;
  }

  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < 0) {
    console.warn('Invalid number in localStorage, using default');
    return defaultValue;
  }

  return parsed;
}
