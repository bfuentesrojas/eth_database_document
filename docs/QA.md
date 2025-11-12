## QA manual – Document Registry dApp

> Completa cada sección con fecha, pasos realizados, wallets utilizadas y resultados observados. Adjunta capturas de pantalla o logs cuando aporte contexto extra.

### 1. Preparación del entorno
- Fecha:
- Versión de Node / Foundry:
- Comandos ejecutados:
  - `anvil --chain-id 31337 --host 127.0.0.1 --port 8545`
  - `FOUNDRY_FFI=1 forge script script/Deploy.s.sol:DeployDocumentRegistry --broadcast --rpc-url http://127.0.0.1:8545 --private-key ...`
  - `npm run dev` (u otro comando relevante)
- Dirección del contrato desplegado: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- Observaciones: Todo se ejecuta correctamente

### 2. Firma de documentos
- Wallet utilizada (índice / dirección): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Archivo o contenido firmado (hash): 0x51b29aaa32e1f7506993ff7a7657cb5099fa0758743775ac82b63105ad8b8da3
- Confirmaciones/alerts mostradas: Confirmación de firma y firma aceptada
- Resultado (✅/⚠️): ✅
- Evidencia (logs, screenshot, tx hash): log
- Observaciones:

### 3. Almacenamiento on-chain
- Wallet utilizada: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Hash almacenado: 0x51b29aaa32e1f7506993ff7a7657cb5099fa0758743775ac82b63105ad8b8da3
- Timestamp utilizado: 12/11/2025, 1:01:57	
- Hash de la transacción: 0x6952630415...d080a08e1b
- Resultado (✅/⚠️): ✅
- Evidencia: log
- Observaciones:

### 4. Verificación de documentos
- Archivo verificado (hash): 0x51b29aaa32e1f7506993ff7a7657cb5099fa0758743775ac82b63105ad8b8da3
- Dirección esperada: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Resultado de la verificación en UI: ✅ El documento es válido y coincide con el firmante.
- Resultado (✅/⚠️): ✅
- Evidencia: log
- Observaciones:

### 5. Historial de documentos
- Número de registros mostrados: 5
- Comparación con datos en contrato (hash/firmante/timestamp): Coinciden
- Resultado (✅/⚠️): ✅
- Evidencia: log
- Observaciones:

### 6. Observaciones generales
- Comportamientos inesperados:
- Mejoras sugeridas:
- Tareas de seguimiento:

