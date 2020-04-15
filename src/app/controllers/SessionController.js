const User = require("../models/User");

const { hash } = require("bcryptjs");
const crypto = require("crypto");
const mailer = require("../../lib/mailer");

module.exports = {
  loginForm(req, res) {
    return res.render("session/login");
  },
  login(req, res) {
    req.session.userId = req.user.id;

    return res.redirect("/users");
  },
  logout(req, res) {
    req.session.destroy();
    return res.redirect("/");
  },
  forgotForm(req, res) {
    return res.render("session/forgot-password");
  },
  async forgot(req, res) {
    const user = req.user;

    try {
      //um token para esse usuário
      const token = crypto.randomBytes(20).toString("hex");

      //criar um experiração
      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now,
      });

      //enviar um email com um link de recuperação de senha
      await mailer.sendMail({
        to: user.email,
        from: "no-replay@launchstore.com.br",
        subject: "Recuperação de senha",
        html: `
        <h2>Perdeu a senha?</h2>
        <p>Não se preucupe, clique no link abaixo para recuperar a sua senha</p>
        <p>
          <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
            RECUPERAR SENHA
          </a>
        </p>
      `,
      });

      //avisar o usuário que enviamos o email
      return res.render("session/forgot-password", {
        success: "Verifique seu email para resetar a senha",
      });
    } catch (err) {
      console.error(err);
      return res.render("session/forgot-password", {
        error: "Erro inesperado, tente novamente",
      });
    }
  },
  resetForm(req, res) {
    return res.render("session/password-reset", { token: req.query.token });
  },
  async reset(req, res) {
    const user = req.user;
    const { password, token } = req.body;

    try {
      //create a new password hash
      const newPassword = await hash(password, 8);
      //update user
      await User.update(user.id, {
        password: newPassword,
        reset_token: "",
        reset_token_expires: "",
      });
      //show to the user that him have a new password
      return res.render("session/login", {
        user: req.body,
        success: "Senha atualizada! Faça o seu login",
      });
    } catch (err) {
      console.error(err);
      return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Erro inesperado, tente novamente",
      });
    }
  },
};
