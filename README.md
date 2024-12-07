# Bobot

Bot do telegram utilizado para descriptografar mensagens utilizando a biblioteca ([OpenPGP](https://www.npmjs.com/package/openpgp).

_Bot_ - @NyyyyxBot

#### Execução da aplicação

OBS.: É necessário adicionar os arquivos .env (variáveis de ambiente) e chave-privada.pem (chave privada do usuário).

```shell
npm install
```

Logo após execute o sistema:

```
npm run start
```

---

#### Variáveis de ambiente

- `CORS_ORIGIN_ALLOWED` - Adicionar hosts para permissionamento do CORS( Cross Origin Resource Sharing ).
- `PORT` - Porta da aplicação.
- `TOKEN` - Token do bot da api do Telegram.
- `PASSPHRASE` - Senha da chave privada.
- `PRIV_KEY_USER` - Nome da chave privada do usuário.

Chaves geradss ao criar um certificado SSL e são usados para habilitar o HTTPS de um site.
Foi utilizada para o webhook, necessário para receber mensagens em tempo real enviadas para o bot.

- `PRIVKEY` - Chave privada gerada ao criar um certificado SSL (para habilitar o HTTPS).
- `FULLCHAIN` - É a concatenação do certificado com o arquivo chain.pem, que é a cadeia de confiança de certificados até o certificado.

## Authors

- **Talita Silva** - _Complements_ - [Talita-Izabel](https://github.com/Talita-Izabel)
