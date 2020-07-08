class DiscountApi {
  constructor() {
    this._url = 'http://142.93.115.206:3002/';
    this._site = '';
    this._user = '';
    this._password = '';
    this._token = '';
    this._siteId = '';
  }

  initialize(url, site, user, password, token, siteId) {
    if (!url.endsWith('/')) {
      url += '/';
    }
    this._url = 'http://142.93.115.206:3002/';
    this._site = site;
    this._user = user;
    this._password = password;
    this._token = token;
    this._siteId = siteId;
  }

  setToken(token) {
    this._token = token;
  }

  setSiteId(siteId) {
    this._siteId = siteId;
  }

  getDiscounts(siteId, date) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    };
    const url = `sema/promotion/${siteId}/${date}`;
    return fetch(this._url + url, options)
      .then((response) => response.json())
      .then((responseJson) => responseJson)
      .catch((error) => {
        throw error;
      });
  }
}

export default new DiscountApi();
