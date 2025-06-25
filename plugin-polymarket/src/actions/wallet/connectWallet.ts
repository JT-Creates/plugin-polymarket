import { 
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type Content,
  logger,
  HandlerCallback,
} from "@elizaos/core/v2";
import { ClobService } from "../../services/clobService"; // Import ClobService 
import { connectWalletExamples } from "../../examples";

export const connectWalletAction: Action = {
  name: "CONNECT_WALLET",
  similes: ["LINK_WALLET", "AUTHORIZE_WALLET"],
  description: "Connects the user's cryptocurrency wallet to Polymarket.",
  examples: [...connectWalletExamples],
  validate: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
  ): Promise<boolean> => {
     const context = (message.content as Content);
     const text = (context.text) ? context.text.toLowerCase() : "";
    return (
      text.includes("connect") &&
      text.includes("wallet") &&
      text.includes("polymarket")
    );
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    _options: {},
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<string> => { 
    // In a real application, you'd trigger a wallet connection flow here.
    const clobService = _runtime.getService(ClobService.serviceType) as
      | ClobService
      | undefined;
    if (!clobService) {
      const errorMsg = "ClobService not available.";
      logger.error(errorMsg);
      await callback({ text: errorMsg });
      return errorMsg;
    }
    
    try {
      // Check if a wallet is already connected
      clobService.getClobClient(); // This will throw an error if not connected
      await callback({ text: "Wallet is already connected." });
      return "Wallet is already connected.";
    } catch (e: any) {
      // Wallet not connected, proceed to request connection
      const eventPayload = { type: "REQUEST_WALLET_CONNECT" };
      await callback({
        text: "Please connect your wallet.",
        metadata: { walletEvent: eventPayload },
      });
      return "Requesting wallet connection... Please check your wallet provider for a connection request.";
    }
  },
}
