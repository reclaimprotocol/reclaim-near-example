import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { useState, useEffect } from "react";
import { useQRCode } from "next-qrcode";

export const CreateNewProof = ({ setNewProof, setReadyToVerify }) => {
  const [url, setUrl] = useState("");
  const { Canvas } = useQRCode();
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState("");
  const [statusUrl, setStatusUrl] = useState("");

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0x6E0338a6D8594101Ea9e13840449242015d71B19"; // This is an example App Id Replace it with your App Id.
      const APP_SECRET =
        "0x1e0d6a6548b72286d747b4ac9f2ad6b07eba8ad6a99cb1191890ea3f77fae48f"; // This is an example App Secret Replace it with your App Secret.
      const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5"; // This is GitHub Provider Id Replace it with the provider id you want to use.

      const proofRequest = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID
      );
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  async function generateVerificationRequest() {
    if (!reclaimProofRequest) {
      console.error("Reclaim Proof Request not initialized");
      return;
    }

    reclaimProofRequest.addContext(
      `user's address`,
      "for acmecorp.com on 1st january"
    );

    const url = await reclaimProofRequest.getRequestUrl();
    setUrl(url);
    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);

    await reclaimProofRequest.startSession({
      onSuccessCallback: (proof) => {
        console.log("Verification success", proof);
        setNewProof(proof);
        setReadyToVerify(true);
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
        <button
          className="btn btn-secondary"
          onClick={generateVerificationRequest}
        >
          Create New Proof
        </button>
      )}
      {url && (
        <Canvas
          text={url}
          options={{
            errorCorrectionLevel: "M",
            margin: 3,
            scale: 4,
            width: 200,
            color: {
              dark: "#010599FF",
              light: "#FFBF60FF",
            },
          }}
        />
      )}
    </div>
  );
};
