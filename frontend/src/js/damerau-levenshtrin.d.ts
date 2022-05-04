declare module "damerau-levenshtein" {
  export interface LevenshteinDistance {
    steps: number;
    relative: number;
    similarity: number;
  }

  export default function levenshtein(
    dis: string,
    dat: string,
  ): LevenshteinDistance;
}
