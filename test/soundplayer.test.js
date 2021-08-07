const soundplayer = require("../src/soundplayer");
const s3 = require("../src/s3database");

jest.mock("../src/s3database");

jest.useFakeTimers();

const voiceChannel = {
  join: jest.fn(),
};

const connection = {
  play: jest.fn(),
};

const dispatcher = {
  on: jest.fn((eventName, callback) => {
    callback();
  }),
  end: jest.fn(),
};

voiceChannel.join.mockReturnValue(connection);
connection.play.mockReturnValue(dispatcher);

describe("play sounds", () => {
  it("join when playing sound", async () => {
    expect.hasAssertions();
    await soundplayer.play(voiceChannel, ["alarm"]);
    expect(voiceChannel.join.mock.calls).toHaveLength(1);
  });

  it("play sound", async () => {
    expect.hasAssertions();
    await soundplayer.play(voiceChannel, ["alarm"]);
    expect(connection.play.mock.calls).toHaveLength(1);
    expect(connection.play.mock.calls[0][0]).toBeDefined();
  });

  it("play two sounds", async () => {
    expect.hasAssertions();
    await soundplayer.play(voiceChannel, ["hallo", "alarm"]);
    expect(connection.play.mock.calls).toHaveLength(2);
    expect(connection.play.mock.calls[0][0]).toBeDefined();
    expect(connection.play.mock.calls[1][0]).toBeDefined();
  });

  it("play playlist", async () => {
    expect.hasAssertions();
    s3.getPlaylist.mockResolvedValueOnce(JSON.stringify(["hallo", "alarm"]));
    await soundplayer.play(voiceChannel, ["whatever"]);
    expect(connection.play.mock.calls).toHaveLength(2);
    expect(connection.play.mock.calls[0][0]).toBeDefined();
    expect(connection.play.mock.calls[1][0]).toBeDefined();
  });

  it("play sound with limited time", async () => {
    expect.hasAssertions();

    await soundplayer.play(voiceChannel, ["alarm(2)"]);

    expect(dispatcher.end.mock.calls).toHaveLength(0);

    jest.advanceTimersByTime(1000);
    expect(dispatcher.end.mock.calls).toHaveLength(0);

    jest.advanceTimersByTime(1000);
    expect(dispatcher.end.mock.calls).toHaveLength(1);

    expect(connection.play.mock.calls).toHaveLength(1);
    expect(connection.play.mock.calls[0][0]).toBeDefined();
  });
});
