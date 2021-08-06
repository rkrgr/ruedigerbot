const soundplayer = require('../src/soundplayer');
const s3 = require('../src/s3database');

jest.mock('../src/s3database');

jest.useFakeTimers();

const voiceChannel = {
  join: jest.fn()
}

const connection = {
  play: jest.fn()
}

const dispatcher = {
  on: jest.fn((eventName, callback) => {
    callback();
  }),
  end: jest.fn()
}

voiceChannel.join.mockReturnValue(connection);
connection.play.mockReturnValue(dispatcher);

beforeEach(() => {
  jest.clearAllMocks();
});

test('join when playing sound', async () => {
  await soundplayer.play(voiceChannel, [ 'alarm' ]);
  expect(voiceChannel.join.mock.calls.length).toBe(1);
});

test('play sound', async () => {
  await soundplayer.play(voiceChannel, [ 'alarm' ]);
  expect(connection.play.mock.calls.length).toBe(1);
  expect(connection.play.mock.calls[0][0]).toBeDefined();
});

test('play two sounds', async () => {
  await soundplayer.play(voiceChannel, [ 'hallo', 'alarm' ]);
  expect(connection.play.mock.calls.length).toBe(2);
  expect(connection.play.mock.calls[0][0]).toBeDefined();
  expect(connection.play.mock.calls[1][0]).toBeDefined();
});

test('play playlist', async () => {
  s3.getPlaylist.mockResolvedValueOnce(JSON.stringify(['hallo', 'alarm']));
  await soundplayer.play(voiceChannel, [ 'whatever' ]);
  expect(connection.play.mock.calls.length).toBe(2);
  expect(connection.play.mock.calls[0][0]).toBeDefined();
  expect(connection.play.mock.calls[1][0]).toBeDefined();
});

test('play sound with limited time', async () => {
  await soundplayer.play(voiceChannel, [ 'alarm(2)' ]);

  expect(dispatcher.end.mock.calls.length).toBe(0);

  jest.advanceTimersByTime(1000);
  expect(dispatcher.end.mock.calls.length).toBe(0);

  jest.advanceTimersByTime(1000);
  expect(dispatcher.end.mock.calls.length).toBe(1);

  expect(connection.play.mock.calls.length).toBe(1);
  expect(connection.play.mock.calls[0][0]).toBeDefined();
});
