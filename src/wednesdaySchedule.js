const schedule = require("node-schedule");

module.exports = (user) => {
  schedule.scheduleJob("8 * * * 3", () => {
    user.setAvatar("./media/wednesday_frog.png");
  });
  schedule.scheduleJob("9 * * * 4", () => {
    user.setAvatar("./media/ruediger.png");
  });
};
