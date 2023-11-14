import express from 'express';
const app = express();
const PORT = process.env.PORT || 4444;

app.post('/order', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { encTxHash: 'order of your tx', order: 1, r, v, s },
  });
});

app.post('/block', (req, res) => {
  res.status(200).json({ message: 'Hello', world: 'Bye' });
});

app.listen(PORT, () => {
  console.log('L2 is running on port: ', PORT);
});
