export default function force(): Promise<Response> {
  return fetch("https://us-central1-autodial-dfeb8.cloudfunctions.net/cron");
}
