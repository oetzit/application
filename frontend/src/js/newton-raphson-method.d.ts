declare module "newton-raphson-method" {
  function newtonRaphson(
    f: (x: number) => number,
    x0: number,
    options?: {
      tolerance?: number;
      epsilon?: number;
      maxIterations?: number;
      h?: number;
      verbose?: boolean;
    },
  ): number | boolean;

  function newtonRaphson(
    f: (x: number) => number,
    fp: (x: number) => number,
    x0: number,
    options?: {
      tolerance?: number;
      epsilon?: number;
      maxIterations?: number;
      h?: number;
      verbose?: boolean;
    },
  ): number | boolean;

  export default newtonRaphson;
}
