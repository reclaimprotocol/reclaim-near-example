import { Reclaim } from "@reclaimprotocol/js-sdk";
import { useState } from "react";
import { useQRCode } from 'next-qrcode';

export const CreateNewProof = ({setNewProof, setReadyToVerify}) => {
  const [url, setUrl] = useState("");
  const { Canvas } = useQRCode();

  const reclaimClient = new Reclaim.ProofRequest("0x1ef80D4B1FA482A3EeE51520e3abf0BD92afEEA0"); //TODO: replace with your applicationId

  async function generateVerificationRequest() {
    const providerId = "1bba104c-f7e3-4b58-8b42-f8c0346cdeab"; //TODO: replace with your provider ids you had selected while creating the application

    reclaimClient.addContext(
      `user's address`,
      "for acmecorp.com on 1st january"
    );

    await reclaimClient.buildProofRequest(providerId, true, "V2Linking");

    reclaimClient.setSignature(
      await reclaimClient.generateSignature(
        "0xed3680366053c0f1af04caeaf45ecd33d65a0dee98febd586580c6b7244483fb" //TODO : replace with your APP_SECRET
      )
    );

    const { requestUrl, statusUrl } =
      await reclaimClient.createVerificationRequest();

    setUrl(requestUrl);

    await reclaimClient.startSession({
      onSuccessCallback: (proofs) => {
        console.log("Verification success", proofs);
        setNewProof(proofs[0]);
        setReadyToVerify(true)
        // Your business logic here
      },
      onFailureCallback: (error) => {
        console.error("Verification failed", error);
        // Your business logic here to handle the error
      },
    });
  }
  return (
    <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        {!url && (
          <button className="btn btn-secondary" onClick={generateVerificationRequest}>
            Create New Proof
          </button>
        )}
        {
        url && <Canvas
            text={url}
            options={{
                errorCorrectionLevel: 'M',
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                dark: '#010599FF',
                light: '#FFBF60FF',
                },
            }}
            />
        }
      </div>
  );
};