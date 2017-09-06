var calculate = function () {
    var e = (Math.min(Math.max(this.data.sliderOptions.price.min, this.model.price), this.data.sliderOptions.price.max), Math.min(Math.max(this.data.sliderOptions.advance.min, this.model.advance), this.data.sliderOptions.advance.max));

    this.model.payment = this.model.price * ((100 - this.model.discount - e) / 100 * Math.pow(1 + this.data.rate / 12, this.model.term) - this.data.oni) / (Math.pow(1 + this.data.rate / 12, this.model.term) - 1) * this.data.rate / 12, this.model.overpayment = (this.model.price * this.model.advance / 100 + this.model.term * this.model.payment - this.model.price) / this.model.price / this.model.term * 12 * 100
}