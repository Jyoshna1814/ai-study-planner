app.post("/check-new-day", async (req, res) => {
  const { user } = req.body;

  if (!user) {
    return res.json({ status: "error", message: "User required" });
  }

  const today = new Date().toISOString().split("T")[0];

  let record = await DailyStatus.findOne({ user });

  if (!record) {
    await DailyStatus.create({ user, lastOpened: today });
    return res.json({ newDay: true });
  }

  if (record.lastOpened !== today) {
    record.lastOpened = today;
    await record.save();
    return res.json({ newDay: true });
  }

  return res.json({ newDay: false });
});