const schedule = require("node-schedule");

module.exports = (user) => {
  schedule.scheduleJob("5 0 * * 3", () => {
    user.setAvatar("./media/wednesday_frog.png");
  });
  schedule.scheduleJob("5 0 * * 4", () => {
    user.setAvatar("./media/ruediger.png");
  });
};
