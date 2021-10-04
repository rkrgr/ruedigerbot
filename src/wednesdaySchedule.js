const schedule = require("node-schedule");

module.exports = (user) => {
  schedule.scheduleJob("* * * * 3", () => {
    user.setAvatar("./media/wednesday_frog.png");
  });
  schedule.scheduleJob("* * * * 4", () => {
    user.setAvatar("./media/ruediger.png");
  });
};
