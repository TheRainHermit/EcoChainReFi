import { useState } from 'react';
import { ethers } from 'ethers';

// ABI del contrato EcoCoin (simplificada, agrega la real)
const ecoCoinAbi = [
  // Ejemplo: función transfer
  "function transfer(address to, uint256 amount) public returns (bool)"
];

const ecoCoinAddress = "0x256492d87947589e589FE58805AC1D36E5488b07";

export default function Web3EcoCoin({ recipient, amount }: { recipient: string, amount: number }) {
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSendEcoCoin = async () => {
    if (!window.ethereum) {
      alert("Instala MetaMask para usar Web3");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(ecoCoinAddress, ecoCoinAbi, signer);

    // amount debe estar en decimales correctos (ejemplo: ethers.parseUnits)
    const tx = await contract.transfer(recipient, amount);
    setTxHash(tx.hash);
  };

  return (
    <div>
      <button onClick={handleSendEcoCoin}>
        Enviar {amount} $EC0 a {recipient}
      </button>
      {txHash && (
        <div>
          <p>Transacción enviada:</p>
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}