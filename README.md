# Dengo 🧡

App de celular para casal, feito com **React Native + Expo** e **Firebase** (login e dados em tempo real entre os dois celulares).

**O que tem:** login, conexão do casal por código, pedir dengo (carinho), pedidos práticos em texto livre, mood do dia com sugestões, "Fique comigo" / "Preciso ficar a sós", mural de desenhos, histórico, **notificações push**, perfil com dias juntos e 5 temas de cor.

---

## 1. O que instalar no computador

- **Node.js** (versão LTS): https://nodejs.org
- No celular de cada um: o app **Expo Go** (App Store ou Google Play) para testar rápido. Para os avisos push, veja a seção 6.

## 2. Criar o Firebase (grátis)

1. Entre em https://console.firebase.google.com e clique em **Adicionar projeto** (pode desligar o Google Analytics).
2. Menu **Criação > Authentication > Vamos começar** > aba **Método de login** > ative **E-mail/senha**.
3. Menu **Criação > Firestore Database > Criar banco de dados**. Escolha a região mais próxima (ex.: `southamerica-east1`) e **modo de produção**.
4. No Firestore, aba **Regras**: apague tudo, cole o conteúdo do arquivo `firestore.rules` deste projeto e clique em **Publicar**.
5. Engrenagem ⚙️ > **Configurações do projeto** > role até **Seus apps** > ícone **Web (`</>`)** > dê um apelido (ex.: `dengo`) > **Registrar app**.
6. Copie o bloco `firebaseConfig` e cole os valores no arquivo `src/firebaseConfig.js`.

## 3. Rodar o app

Abra o terminal dentro da pasta do projeto:

```bash
npm install
npx expo install --fix
npx expo start
```

O `expo install --fix` ajusta as bibliotecas para a versão certa do Expo. Aparece um **QR code**: abra o **Expo Go** no celular e escaneie (no iPhone, pela câmera). Celular e computador precisam estar na mesma rede Wi-Fi. Se a rede bloquear, use `npx expo start --tunnel`.

## 4. Testar como casal

1. No celular 1: **Criar conta** (nome, e-mail, senha). Aparece o seu **código de casal**.
2. No celular 2: **Criar conta** e digitar o código do celular 1 em **Conectar**.
3. Pronto: os dois entram no app e tudo que um faz aparece na hora no outro.

## 5. Como funciona por dentro

| Coleção | O que guarda |
|---|---|
| `users/{uid}` | nome, e-mail, código de casal, par, tema de cor |
| `codes/{código}` | só o uid e o nome, para achar o par pelo código |
| `couples/{id}` | mood de cada um, pedidos, dengos, recado, "fique comigo", data de início |
| `couples/{id}/hist` | histórico do casal |
| `couples/{id}/mural` | desenhos (guardados como traços, sem precisar de Storage) |

As regras em `firestore.rules` garantem que **só os dois do casal** leiam e escrevam os dados deles.

## 6. Notificações push (avisos com o app fechado)

Quando um dos dois pede dengo, faz um pedido, responde, marca o humor, deixa um recado ou um desenho, o outro recebe um aviso no celular. Cada pessoa pode desligar isso em **Perfil > Notificações**.

**Importante:** desde o Expo SDK 53, aviso push **não funciona no Expo Go**. Tudo o resto do app funciona no Expo Go; para os avisos você precisa instalar o app pelo **EAS Build** (passos abaixo). Não precisa de servidor nem de plano pago do Firebase: o aviso é enviado direto pelo serviço gratuito de push da Expo.

### 6.1 Conta e projeto na Expo

```bash
npm install -g eas-cli
eas login          # crie uma conta grátis em expo.dev, se ainda não tiver
eas init           # liga esta pasta a um projeto na Expo (grava o projectId no app.json)
```

Antes, troque `com.seunome.dengo` em `app.json` (`ios.bundleIdentifier` e `android.package`) por um identificador seu, por exemplo `com.seunomeeluna.dengo`.

### 6.2 Android (Firebase Cloud Messaging)

1. No console do Firebase: ⚙️ **Configurações do projeto > Seus apps > Adicionar app > Android**. Use **o mesmo identificador** do `android.package`. Baixe o `google-services.json` e coloque na **raiz do projeto** (ao lado do `app.json`).
2. Ainda em Configurações do projeto > aba **Contas de serviço** > **Gerar nova chave privada**. Guarde o arquivo `.json` baixado.
3. Envie essa chave para a Expo: rode `eas credentials`, escolha **Android > production ou development > Google Service Account > Manage your Google Service Account Key for Push Notifications (FCM V1)** e envie o arquivo.

### 6.3 iPhone

Precisa de conta **Apple Developer** (paga). No `eas build` a Expo cria e guarda as chaves de push sozinha; é só aceitar as perguntas do terminal.

### 6.4 Gerar e instalar o app

```bash
# versão de teste (com recarregamento ao vivo, igual ao Expo Go):
eas build --profile development --platform android     # ou ios
# versão para usar no dia a dia, sem computador:
eas build --profile preview --platform android
```

Quando o build terminar (uns 15 a 20 minutos), o terminal mostra um link e um QR code: abra no celular e instale. Nos dois celulares, ao abrir o app pela primeira vez, **aceite a permissão de notificações**.

Para a versão de desenvolvimento, depois de instalada, rode `npx expo start --dev-client` e abra o app pelo celular.

### 6.5 Como o aviso funciona

- Cada celular guarda o próprio "token" no perfil do usuário (`users/{uid}.pushToken`). Só você e o seu par conseguem ler esse perfil.
- Quando você faz uma ação, o app envia o aviso ao token do par. Ao tocar no aviso, o app abre na tela inicial (ou no mural, se for um desenho).
- Ao sair da conta, o token é apagado daquele celular, para não chegar aviso de outra pessoa.
- Se o par desligar as notificações ou ainda não tiver aberto o app instalado, o aviso simplesmente não é enviado (o dado continua salvo e aparece no app).

## 7. Se algo der errado

- **"Component auth has not been registered yet"**: rode `npx expo install --fix` e depois `npx expo start -c` (limpa o cache).
- **Nada carrega / "permission-denied"**: confira se as regras do passo 2.4 foram **publicadas** e se o Authentication com e-mail/senha está ativo.
- **Não consegui conectar com o código**: os dois precisam ter criado conta, e o código só vale se a pessoa ainda não estiver conectada a outra conta.
- **Travou no Wi-Fi**: tente `npx expo start --tunnel`.
- **Não chega aviso**: confira que está no app instalado pelo EAS Build (não no Expo Go), em um celular de verdade, com a permissão de notificações aceita, que o `eas init` foi feito, e (Android) que o `google-services.json` e a chave FCM V1 foram configurados. O outro celular também precisa ter aberto o app pelo menos uma vez depois de instalar.

## Próximos passos (ideias)

- Foto de perfil, widget na tela inicial, mais tipos de dengo.
- Enviar os avisos por um servidor (Cloud Functions) em vez de pelo app, o que deixa tudo mais à prova de falhas. Exige o plano Blaze do Firebase (pago por uso, com cota grátis).
