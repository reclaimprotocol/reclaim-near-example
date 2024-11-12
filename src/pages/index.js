import styles from "@/styles/app.module.css";
import { useState, useEffect, useContext } from "react";
import { ReclaimNearContract, SMOKE_PROOF } from "../config";
import { NearContext } from "@/context";
import { Navigation } from "@/components/navigation";
import { transformForOnchain } from "@reclaimprotocol/js-sdk";
import { CreateNewProof } from "@/components/create-new-proof";

// Contract that the app will interact with
const CONTRACT = ReclaimNearContract;

export default function Home() {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [epoch, setEpoch] = useState("loading...");
  const [newGenProof, setNewGenProof] = useState({});
  const [readyToVerify, setReadyToVerify] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    wallet
      .viewMethod({
        contractId: CONTRACT,
        method: "get_epoch_by_id",
        args: { epoch_id: "1" },
      })
      .then((epoch) => {
        console.log(epoch);
        setEpoch(epoch);
      });
  }, [wallet]);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const verifyProof = async (proof) => {
    setShowSpinner(true);
    const newProof = transformForOnchain(proof);
    newProof.signedClaim.signatures[0] =
      newProof.signedClaim.signatures[0].replace("0x", "");
    newProof.signedClaim.claim.owner = newProof.signedClaim.claim.owner.replace(
      "0x",
      ""
    );
    newProof.signedClaim.claim.identifier =
      newProof.signedClaim.claim.identifier.replace("0x", "");
    const tx = await wallet.callMethod({
      contractId: CONTRACT,
      method: "verify_proof",
      args: { proof: newProof },
    });
    console.log(tx);
    setTransaction(tx);
    setShowSpinner(false);
  };

  return (
    <>
      <div hidden={!loggedIn}>
        <Navigation />
      </div>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Interacting with the contract: &nbsp;
            <code className={styles.code}>
              Reclaim Contract on Near - Testnet
            </code>
          </p>
        </div>

        <div>
          <h1 className="w-100">The contract says - Current Epoch</h1>
          {typeof epoch == "string" ? (
            <div>{epoch}</div>
          ) : (
            <div>
              <code>
                id : {epoch.id} <br />
              </code>
              <code>
                Minimum Witnesses for Claim Creation:{" "}
                {epoch.minimum_witness_for_claim_creation} <br />
              </code>
              <code>Witnesses: {epoch.witnesses.map((w) => w.address)}</code>
            </div>
          )}
        </div>

        <div hidden={!loggedIn}>
          <div className={styles.col}>
            <button
              className="btn btn-secondary"
              onClick={() => verifyProof(SMOKE_PROOF)}
            >
              <span hidden={showSpinner}> Verify Proof with MOCK_PROOF </span>
              <i
                className="spinner-border spinner-border-sm"
                hidden={!showSpinner}
              ></i>
            </button>
            <div hidden={readyToVerify}>
              <CreateNewProof
                setNewProof={setNewGenProof}
                setReadyToVerify={setReadyToVerify}
              />
            </div>
            <div hidden={!readyToVerify} className={styles.description}>
              <button
                className="btn btn-secondary"
                onClick={() => verifyProof(newGenProof)}
              >
                <span hidden={showSpinner}> Verify New Generated Proof </span>
                <i
                  className="spinner-border spinner-border-sm"
                  hidden={!showSpinner}
                ></i>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.description} hidden={loggedIn}>
          <p className="m-0"> Please login to verify proofs </p>
          <Navigation />
        </div>
      </main>
    </>
  );
}
