require('module-alias/register');
const FOBasePage = require('@pages/FO/FObasePage');

module.exports = class Cart extends FOBasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'Cart';

    // Selectors for cart page
    this.productItem = number => `#main li:nth-of-type(${number})`;
    this.productName = number => `${this.productItem(number)} div.product-line-info > a`;
    this.productPrice = number => `${this.productItem(number)} div.current-price > span`;
    this.productQuantity = number => `${this.productItem(number)} div.input-group input.js-cart-line-product-quantity`;
    this.proceedToCheckoutButton = '#main div.checkout a';
    this.disabledProceedToCheckoutButton = '#main div.checkout button.disabled';
    this.cartTotalTTC = '.cart-summary-totals span.value';
    this.itemsNumber = '#cart-subtotal-products span.label.js-subtotal';
    this.alertWarning = '.checkout.cart-detailed-actions.card-block div.alert.alert-warning';
  }

  /**
   * Get Product detail from cart (product name, price, quantity)
   * @param row, product row in cart
   * @returns {Promise<{quantity: (number), price: (string), name: (string)}>}
   */
  async getProductDetail(row) {
    return {
      name: await this.getTextContent(this.productName(row)),
      price: await this.getTextContent(this.productPrice(row)),
      quantity: parseFloat(await this.getAttributeContent(this.productQuantity(row), 'value')),
    };
  }

  /**
   * Click on Proceed to checkout button
   * @returns {Promise<void>}
   */
  async clickOnProceedToCheckout() {
    await this.waitForVisibleSelector(this.proceedToCheckoutButton);
    await this.clickAndWaitForNavigation(this.proceedToCheckoutButton);
  }

  /**
   * To edit the product quantity
   * @param productID
   * @param quantity
   * @returns {Promise<void>}
   */
  async editProductQuantity(productID, quantity) {
    await this.setValue(this.productQuantity(productID), quantity.toString());
    // click on price to see that its changed
    await this.page.click(this.productPrice(productID));
  }

  /**
   * Get a number from text
   * @param selector
   * @param timeout
   * @returns {Promise<number>}
   */
  async getPriceFromText(selector, timeout = 0) {
    await this.page.waitForTimeout(timeout);
    const text = await this.getTextContent(selector);
    const number = Number(text.replace(/[^0-9.-]+/g, ''));
    return parseFloat(number);
  }

  /**
   * Get price TTC
   * @returns {Promise<number>}
   */
  async getTTCPrice() {
    return this.getPriceFromText(this.cartTotalTTC);
  }

  /**
   * Is proceed to checkout button disabled
   * @returns {boolean}
   */
  isProceedToCheckoutButtonDisabled() {
    return this.elementVisible(this.disabledProceedToCheckoutButton, 1000);
  }

  /**
   * Is alert warning for minimum purchase total visible
   * @returns {boolean}
   */
  isAlertWarningForMinimumPurchaseVisible() {
    return this.elementVisible(this.alertWarning, 1000);
  }

  /**
   * Get alert warning
   * @returns {Promise<string>}
   */
  getAlertWarning() {
    return this.getTextContent(this.alertWarning);
  }
};
