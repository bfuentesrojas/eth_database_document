<div align="center">

# Document Registry dApp

Aplicación full-stack para registrar, firmar y verificar documentos sobre Ethereum utilizando Foundry y Next.js.

</div>

## 🚀 Descripción general

Este repositorio contiene:

- **Contratos inteligentes** en Solidity (`contracts/`) con Foundry.
- **Script de despliegue** (`script/Deploy.s.sol`) que además orquesta el entorno local (Anvil + Next.js).
- **Front-end** en Next.js (`dapp/`) que permite subir archivos, firmar hashes y consultar historial on-chain.

El proyecto está pensado para un flujo local rápido con Anvil y un conjunto de wallets deterministas que simulan una experiencia similar a MetaMask.

## 📦 Requisitos previos

- [Node.js](https://nodejs.org/) >= 18
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)
- [Git](https://git-scm.com/)

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/<tu-usuario>/eth_database_document.git
cd eth_database_document

# Instalar dependencias de Node (para la dapp)
npm install

# Instalar dependencias de Foundry (si aún no lo hiciste en la máquina)
forge install
```

> El proyecto incluye `lib/forge-std` como submódulo de Foundry. Si clonas con `--recurse-submodules` tendrás todo listo desde el inicio.

## ⚙️ Variables de entorno

La configuración por defecto funciona sin archivos `.env`, pero puedes personalizarla:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_RPC_URL` | URL RPC utilizada por la dapp | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Dirección del contrato `DocumentRegistry` | Se establece tras despliegue |
| `NEXT_PUBLIC_MNEMONIC` | Mnemónico para derivar wallets locales | Mnemónico de Anvil |

Para personalizar, crea un archivo `dapp/.env.local` con las variables deseadas.

## 🧪 Ejecutar pruebas

```bash
# Ejecutar pruebas de contratos
forge test

# Generar reporte de cobertura (solo contratos)
forge coverage --profiles coverage
```

## 🏗️ Despliegue local rápido

1. **Arrancar Anvil (opcional)**  
   Puedes dejar que el script lo levante automáticamente, pero si prefieres hacerlo manualmente:
   ```bash
   anvil --chain-id 31337 --host 127.0.0.1 --port 8545
   ```

2. **Ejecutar script de despliegue**  
   ```bash
   FOUNDRY_FFI=1 forge script script/Deploy.s.sol:DeployDocumentRegistry \
     --broadcast \
     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
     --rpc-url http://127.0.0.1:8545
   ```
   El script:
   - Prepara un directorio `tmp/` para logs.
   - Asegura que Anvil se esté ejecutando.
   - Despliega `DocumentRegistry`.
   - Inicia la dapp de Next.js en `http://localhost:3001`.

3. **Acceder a la dapp**  
   Abre `http://localhost:3001` y utiliza cualquiera de las wallets derivadas (combo en la cabecera) para firmar/verificar documentos.

## 📁 Estructura del proyecto

```
contracts/                 Contratos Solidity y sus interfaces
script/                    Scripts de despliegue (Foundry)
test/                      Pruebas unitarias de contratos y scripts
dapp/                      Aplicación Next.js + Tailwind
  ├─ app/                  Páginas y layout principal
  ├─ components/           Componentes UI (uploader, signer, verifier, history)
  ├─ contexts/             Contexto para simular MetaMask
  └─ hooks/                Hooks para interactuar con el contrato
foundry.toml               Configuración Foundry (incluye perfil de cobertura)
package.json               Scripts y dependencias del front-end
.gitignore                 Ignora artefactos generados (out, cache, tmp, broadcast, etc.)
```

## 🧹 Buenas prácticas incluidas

- Contratos y componentes documentados para fácil mantenimiento.
- Scripts de despliegue con instrucciones claras en consola.
- `.gitignore` preparado para artefactos de Foundry, Next.js y logs temporales.
- Archivos generados (`broadcast/`, `tmp/`) excluidos del repositorio.

## 📤 Preparar para GitHub

1. Revisa la salida de `git status` para confirmar que solo se rastrean los archivos relevantes.
2. Ejecuta pruebas y linting antes de hacer commit:
   ```bash
   forge test
   npm run lint   # si agregas ESLint a futuro
   ```
3. Crea un nuevo repositorio en GitHub y sigue las instrucciones de `git remote add origin ...` y `git push`.

---

¡Listo! Ahora tienes una base sólida para custodiar documentos en Ethereum y una dapp lista para iterar o desplegar. Si amplías el proyecto (por ejemplo, soporte IPFS o subida a S3), añade las instrucciones correspondientes a este README.

