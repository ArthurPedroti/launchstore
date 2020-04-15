const Intl = require("intl");

module.exports = {
  date(timestamp) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hour = date.getHours() - 3;
    const minutes = date.getMinutes();

    return {
      day,
      month,
      year,
      hour,
      minutes,
      iso: `${year}-${month}-${day}`,
      birthDay: `${day}/${month}`,
      format: `${day}/${month}/${year}`,
    };
  },
  formatPrice(price) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100);
  },
  formatCpfCnpj(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 14) value = value.slice(0, -1);

    //check if is cpf or cnpj
    if (value.length > 11) {
      //cjnp - 11.222.333/4444-55
      //initial value = 11222333444455

      //11.222333444455 = 2 digits in a row
      value = value.replace(/(\d{2})(\d)/, "$1.$2");

      //11.222.333444455 = 3 digits in a row
      value = value.replace(/(\d{3})(\d)/, "$1.$2");

      //11.222.333/444455 = 3 digits in a row
      value = value.replace(/(\d{3})(\d)/, "$1/$2");

      //11.222.333/4444-55 = 4 digits in a row
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      //cpf 111.222.333-44

      //111.22233344 = 3 digits in a row
      value = value.replace(/(\d{3})(\d)/, "$1.$2");

      //111.222.33344 = 3 digits in a row
      value = value.replace(/(\d{3})(\d)/, "$1.$2");

      //111.222.333-44 = 3 digits in a row
      value = value.replace(/(\d{3})(\d)/, "$1-$2");
    }

    return value;
  },
  formatCep(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, -1);

    //29216-080 = 5 digits in a row
    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    return value;
  },
};
