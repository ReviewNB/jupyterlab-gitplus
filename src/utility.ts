export function get_json_request_payload_from_file_list(files: string[]) {
  const file_list = [];
  for (const f of files) {
    const entry = {
      path: f
    };
    file_list.push(entry);
  }
  return {
    files: file_list
  };
}
