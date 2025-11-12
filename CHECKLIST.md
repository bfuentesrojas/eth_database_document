## Entrega: Document Registry dApp

### Smart Contracts
- ✅ `DocumentRegistry.sol` implementado y documentado; sin redundancias.
- ✅ Struct sin campo `exists`; la existencia se deduce del `signer`.
- ✅ No existe mapping `hashExists`; se reutiliza el mismo storage.
- ✅ 11/11 tests pasando (`forge test` con 9 tests para contrato + 2 del script).
- ✅ Script de despliegue funcional (`script/Deploy.s.sol`).
- ✅ Contrato desplegado contra Anvil durante las pruebas (`0x5FbDB2315678afecb367f032d93F642f64180aa3`).
- ✅ ABI exportado para frontend (`dapp/abi/DocumentRegistry.json` + nota en README).

### Frontend
- ✅ Context Provider implementado (`MetaMaskProvider`).
- ✅ Wallets derivadas del mnemonic de Anvil.
- ✅ Hook `useContract` operativo para todas las llamadas.
- ✅ `FileUploader` completo y calculando hash.
- ✅ `DocumentSigner` incluye alerts y manejo de errores.
- ✅ `DocumentVerifier` recalcula hash y compara con datos on-chain.
- ✅ `DocumentHistory` muestra registros con timestamp legible.
- ✅ Página principal con tabs (Upload, Verify, History).
- ✅ Selector de wallet funcional y sincronizado con el contexto.
- ✅ UI responsiva y moderna validada manualmente (capturas guardadas en `docs/imagenes/`).

### Integración
- ✅ El frontend se conecta con el contrato mediante `ethers.JsonRpcProvider`.
- ✅ Firmas funcionan: pruebas manuales registradas en `docs/QA.md` (wallet derivada, hash firmado y confirmaciones).
- ✅ Almacenamiento en blockchain: transacciones confirmadas durante el QA (ver `docs/logs/anvil.log` y `docs/QA.md`).
- ✅ Verificación funciona: casos registrados en el QA, comparando hash y signer.
- ✅ Historial muestra documentos: validado contra datos reales almacenados durante las pruebas.

### Documentación
- ✅ `README.md` actualizado con contexto general.
- ✅ Comentarios en contratos y componentes clave.
- ✅ Variables de entorno documentadas en el README.
- ✅ `.gitignore` configurado para artefactos (`node_modules`, `.next`, `cache/`, `out/`, `broadcast/`, `tmp/`).
- ✅ Instrucciones de instalación claras y en español.

### Git
- ✅ Repositorio inicializado y remoto configurado.
- ⚠️ Commits descriptivos: solo existe el commit inicial; se recomienda continuar con convención consistente.
- ✅ `.gitignore` correcto (`lib/`, `cache/`, `out/`): se ignoran `cache/`, `out/` y ahora también `lib/`.
- ✅ El repositorio solo contiene código fuente relevante (sin `node_modules` ni dependencias vendorizadas).

---

### Resumen de cumplimiento
- Total ítems revisados: 26  
- Cumplidos (✅): 25  
- Parciales/Pendientes (⚠️): 1  
- No cumplidos (❌): 0  

Acciones sugeridas: mantener una convención clara en commits futuros.
