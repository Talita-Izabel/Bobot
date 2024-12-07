import axios from 'axios'
import fs from 'fs'
const FormData = require('form-data')
const openpgp = require('openpgp')

class Bot {
  constructor() {
    this.chatId = null
    this.token = process.env.TOKEN
  }

  async verifyMessage(body) {
    try {
      console.log('Message: ', body)

      const { message } = body

      // Verifica se é documento ou texto
      let dataMessage = message.document
        ? await this.isFile(
            message.document.file_id,
            message.document.mime_type,
            message.file_name
          )
        : await this.isText(message.text)

      this.chatId = message.chat.id

      await this.decryptMessage(dataMessage)
    } catch (error) {
      console.error(error)
    }
  }

  async isFile(fileId, type, fileName) {
    try {
      // Obtém detalhes do arquivo
      let dataFile = await axios.get(
        `https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`
      )

      dataFile = dataFile.data.result

      // TODO: testar pdf criptografado
      if (type == 'application/pdf') {
        let file = await axios.get(
          `https://api.telegram.org/file/bot${this.token}/${dataFile.file_path}`,
          { responseType: 'arraybuffer' }
        )
        return { message: Buffer.from(file.data), isFile: true, type, fileName }
      }

      // Baixa o arquivo
      let file = await axios.get(
        `https://api.telegram.org/file/bot${this.token}/${dataFile.file_path}`
      )
      return { message: file.data, isFile: true, type, fileName }
    } catch (error) {
      console.error(error)
    }
  }

  async isText(text) {
    try {
      // Adiciona o cabeçalho PGP
      text = `-----BEGIN PGP MESSAGE-----\n\n${text}\n-----END PGP MESSAGE-----\n`

      return { message: text, isFile: false }
    } catch (error) {
      console.error(error)
    }
  }

  async decryptMessage(dataMessage) {
    try {
      let { message, isFile, type, fileName } = dataMessage

      // Lê a chave privada
      const privateKeyArmored = fs.readFileSync(
        `${process.cwd()}/${process.env.PRIV_KEY_USER}`,
        {
          encoding: 'utf8',
          flag: 'r',
        }
      )
      const passphrase = process.env.PASSPHRASE

      // Lê e descriptografa a chave privada
      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({
          armoredKey: privateKeyArmored,
        }),
        passphrase,
      })

      // Detecta se o conteúdo é binário ou armored
      if (
        typeof message === 'string' &&
        message.includes('BEGIN PGP MESSAGE')
      ) {
        message = await openpgp.readMessage({
          armoredMessage: message,
        })
      } else {
        message = await openpgp.readMessage({
          binaryMessage: message,
        })
      }

      // Descriptografa a mensagem
      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
      })

      // Envia arquivo. Trata o tipo pdf (converte para pdf).
      if (isFile && type == 'application/pdf') {
        const pdfBuffer = Buffer.from(decrypted, 'binary')
        await this.sendDocument(pdfBuffer, fileName)
      } else {
        // Envia mensagem de texto
        await this.sendMessage(decrypted)
      }
    } catch (error) {
      console.error(error, '\n', error.message)

      if (error.message.includes('Session key decryption failed')) {
        await this.sendMessage('Essa mensagem não era para a Talita. ¬¬')
      } else if (
        error.message.includes('decrypting message: Decryption error')
      ) {
        await this.sendMessage(
          'Não foi possível descriptografar essa mensagem com a chave da Talita. ¬¬'
        )
      }
    }
  }

  async sendMessage(text) {
    try {
      const res = await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        {
          chat_id: this.chatId,
          text,
        }
      )

      console.log('Envio da mensagem de texo: ', res.data)
    } catch (error) {
      console.error(error)
    }
  }

  async sendDocument(decryptedContent, fileName) {
    try {
      //console.log(decryptedContent)

      const form = new FormData()
      form.append('chat_id', this.chatId)
      form.append('document', decryptedContent, {
        filename: fileName, // Nome do arquivo a ser enviado
        contentType: 'application/pdf', // Tipo MIME do arquivo
      })

      const res = await axios.post(
        `https://api.telegram.org/bot${this.token}/sendDocument`,
        form,
        { headers: form.getHeaders() }
      )

      console.log('Envio do documento: ', res.data)
    } catch (error) {
      console.error(error)
    }
  }
}

export default new Bot()
