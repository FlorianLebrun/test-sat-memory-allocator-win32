#include <node-webengine-hosting>
extern"C" webx::IEngineContext* test_sat_connect(webx::IEngineHost* host, const char* config);

void main() {
  test_sat_connect(0, "");
  getchar();
}
