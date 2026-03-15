// Helper to emit socket events from anywhere in the app
const emitBidPlaced = (io, auctionId, payload) => {
  if (!io) return;
  io.to(auctionId).emit('bid_placed', payload);
  console.log(`[WS] bid_placed emitted to room: ${auctionId}`);
};

const emitAuctionStatusChanged = (io, auctionId, status) => {
  if (!io) return;
  io.to(auctionId).emit('auction_status_changed', { auctionId, status });
  console.log(`[WS] auction_status_changed emitted: ${auctionId} → ${status}`);
};

module.exports = { emitBidPlaced, emitAuctionStatusChanged };