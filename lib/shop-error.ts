// A shop rule refused the request. The message is written for the customer and
// is shown on the page they were on.
export class ShopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopError";
  }
}
