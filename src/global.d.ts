declare module 'traditional-or-simplified' {
  interface IDetectResult {
    inputLength: number;
    simplifiedCharacters: number;
    traditionalCharacters: number;
    detectedCharacters: 'traditional' | 'simplified' | 'unknown';
    detectionRate: number;
  }
  function isSimplified(string): boolean;
  function isTraditional(string): boolean;

  function detect(string): IDetectResult;
}
