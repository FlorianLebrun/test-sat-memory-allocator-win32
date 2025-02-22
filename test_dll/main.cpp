#include <sat-memory-allocator-win32>
#include <node-webengine-hosting>
#include <vector>
#include <assert.h>
#include "./test_alloc.h"
#include "./btree.h"

extern"C" webx::IEngineContext* sat_connect(webx::IEngineHost* host, const char* config);

struct myClass2 {
  static SAT::TypeDefID typeID;
  uint32_t x;
};
SAT::TypeDefID myClass2::typeID = 0;

struct myClass1 {
  static SAT::TypeDefID typeID;
  myClass1* x;
  myClass2* y;
};
SAT::TypeDefID myClass1::typeID = 0;

struct tTest {
  static const int sizeMin = 10;
  static const int sizeMax = 5000;
  static const int count = 100000;

  tTest()
  {
  }

  __declspec(noinline) void test_sat_malloc_2()
  {
    Chrono c;
    std::vector<void*> objects(count);
    int sizeDelta = sizeMax - sizeMin;
    c.Start();
    printf(">>> start: %lg s\n", sat_get_contoller()->getCurrentTime());
    for (int i = 0; i < count; i++) {
      int size = sizeMin + (sizeDelta ? fastrand() % sizeDelta : 0);
      SAT::tObjectInfos infos;
      objects[i] = sat_malloc_ex(4887, size);
      // printf(">> %d bytes at %.8X\n", int(size), uintptr_t(objects[i]));
    }
    printf("[SAT-malloc] alloc time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));
    printf(">>> end: %lg s\n", sat_get_contoller()->getCurrentTime());
    c.Start();

    int remain = 5;
    SAT::tObjectInfos infos;
    if (0) {
      for (int i = remain; i < count; i++) {
        int k = fastrand() % objects.size();

        void* obj = objects[k];
        objects[k] = objects.back();
        objects.pop_back();
        sat_free(obj);
      }
    }
    else if (1) {
      for (int i = remain; i < count; i++) {
        int k = objects.size() - 1;
        void* obj = objects[k];

        if (sat_get_address_infos(obj, &infos)) {
          if (infos.heapID != 0) {
            printf("bad heapID\n");
          }
        }
        else {
          printf("bad object\n");
        }

        objects.pop_back();
        sat_free(obj);

        /*for (int j = objects.size() - 1; j >= 0; j--) {
          if (sat_get_address_infos(objects[j], &infos)) {
            if (infos.heapID != 0) throw std::exception("bad heapID");
          }
          else {
            throw std::exception("bad object");
          }
        }*/
      }
    }
    else {
      for (int i = remain; i < count; i++) {
        void* obj = objects[i];
        sat_free(obj);
      }
    }
    printf("[SAT-malloc] free time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));
    for (int i = 0; i < remain; i++) {
      printf(">> remain at %.8X\n", uintptr_t(objects[i]));
    }

    return;
  }
  __declspec(noinline) void test_sat_malloc() {
    Chrono c;
    std::vector<void*> objects(count);
    int sizeDelta = sizeMax - sizeMin;
    c.Start();
    for (int i = 0; i < count; i++) {
      int size = sizeMin + (sizeDelta ? fastrand() % sizeDelta : 0);
      objects[i] = sat_malloc(size);
    }
    printf("[SAT-malloc] alloc time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));

    c.Start();
    for (int i = 0; i < count; i++) {
      sat_free(objects[i]);
    }
    printf("[SAT-malloc] free time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));
  }
  __declspec(noinline) void test_tc_malloc() {
    Chrono c;
    std::vector<void*> objects(count);
    int sizeDelta = sizeMax - sizeMin;
    c.Start();
    for (int i = 0; i < count; i++) {
      int size = sizeMin + (sizeDelta ? fastrand() % sizeDelta : 0);
      objects[i] = tc_malloc(size);
    }
    printf("[TC-malloc] alloc time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));

    c.Start();
    for (int i = 0; i < count; i++) {
      tc_free(objects[i]);
    }
    printf("[TC-malloc] free time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));
  }
  __declspec(noinline) void test_default_malloc() {
    Chrono c;
    std::vector<void*> objects(count);
    int sizeDelta = sizeMax - sizeMin;
    ::_tcmalloc();
    c.Start();
    for (int i = 0; i < count; i++) {
      int size = sizeMin + (sizeDelta ? fastrand() % sizeDelta : 0);
      objects[i] = ::malloc(size);
    }
    printf("[Default-malloc] alloc time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));

    c.Start();
    for (int i = 0; i < count; i++) {
      ::free(objects[i]);
    }
    printf("[Default-malloc] free time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));
  }
  __declspec(noinline) void test_types()
  {
    /*{
      SAT::ITypesController* types = sat_get_types_controller();
      SAT::TypeDef def_uint32_t = types->createBufferType("uint32_t", 0, SAT::ENC_INT, sizeof(uint32_t));
      SAT::TypeDef def_myClass1 = types->createClassType("myClass1", 0, sizeof(myClass1), 2, 0);
      SAT::TypeDef def_myClass2 = types->createClassType("myClass2", 0, sizeof(myClass2), 0, 1);

      myClass1::typeID = types->getTypeID(def_myClass1);
      myClass2::typeID = types->getTypeID(def_myClass2);

      def_myClass1->setRef(0, &SAT::tTypeDef::zero<myClass1>().x, myClass2::typeID);
      def_myClass1->setRef(1, &SAT::tTypeDef::zero<myClass1>().y, myClass2::typeID);

      def_myClass2->setBuffer(0, &SAT::tTypeDef::zero<myClass2>().x, types->getTypeID(def_uint32_t));
    }*/

    Chrono c;
    static const int count = 50000;
    std::vector<myClass1*> objects(count);
    c.Start();

    for (int i = 0; i < count; i++) {
      objects[i] = new (sat_malloc_ex(myClass1::typeID, sizeof(myClass1))) myClass1();
    }
    printf("[SAT-malloc] alloc object time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));

    c.Start();
    for (int i = 0; i < count; i++) {
      int k = fastrand() % objects.size();
      void* obj = objects[k];
      objects[k] = objects.back();
      objects.pop_back();
      sat_free(obj);
    }
    printf("[SAT-malloc] free object time = %g ns\n", c.GetDiffFloat(Chrono::NS) / float(count));

    struct Visitor : SAT::IObjectVisitor {
      virtual bool visit(SAT::tpObjectInfos obj) override {
        printf("%.8X\n", obj->base);
        return true;
      }
    };
    sat_get_contoller()->traverseObjects(&Visitor());
  }

  __declspec(noinline) void test_alloc_perf()
  {
    int size_min = 10, size_max = 4000;
    MultiThreadAllocTest<4> multi;
#define TestID 1
#if TestID == 1
    DefaultAllocTest().Run(size_min, size_max);
    multi.Run(&DefaultAllocTest(), size_min, size_max);
#elif TestID == 2
    TCmallocAllocTest().Run(size_min, size_max);
    multi.Run(&TCmallocAllocTest(), size_min, size_max);
#elif TestID == 3
    SATmallocAllocTest().Run(size_min, size_max);
    multi.Run(&SATmallocAllocTest(), size_min, size_max);
#endif
  }

  void test_alloc()
  {
    SAT::IController* sat = sat_get_contoller();
    SAT::IThread* thread = sat->getCurrentThread();
    SAT::Mark mark;

    SAT::Mark test_mark = sat_mark_message("test", "Test begin");
    thread->watch();

    mark = sat_mark_message("test", "sat_malloc test 2");
    this->test_sat_malloc_2();
    mark->complete();
    Sleep(50);

    mark = sat_mark_message("test", "tc_malloc");
    this->test_tc_malloc();
    mark->complete();
    Sleep(50);

    mark = sat_mark_message("test", "sat_malloc");
    this->test_sat_malloc();
    mark->complete();
    Sleep(50);

    mark = sat_mark_message("test", "default_malloc");
    this->test_default_malloc();
    sat_marking_print();
    mark->complete();

    thread->unwatch();
    test_mark->complete();

  }
};


struct TestBTree : public Btree<uint64_t, 4>
{
  virtual BtNode* allocNode() { return new BtNode(); }
  virtual void freeNode(BtNode* node) { delete node; }
  void test() {
    /*
    uint64_t found = 0;
    this->insert(0);
    this->insert(5);
    this->insert(10);
    this->insert(15);
    this->insert(20);
    if (this->removeUpper(21, found)) {
      printf("found %d\n", found);
      this->display();
    }*/


    int count = 100000;
    for (int i = 0; i < count; ) {
      uint64_t value = uint64_t(rand())*uint64_t(rand());
      if (this->insert(value)) {
        i++;
      }
    }
    for (int i = 0; i < count; ) {
      uint64_t value = uint64_t(rand())*uint64_t(rand());
      uint64_t found = 0;
      if (this->removeUpper(value, found)) {
        assert(value <= found);
        i++;
      }
    }
  }
};

extern"C" webx::IEngineContext* test_sat_connect(webx::IEngineHost* host, const char* config) {

  sat_get_contoller()->setEnable(SAT::OBJECT_STACK_TRACING);
  //sat_get_contoller()->setEnable(SAT::OBJECT_TIME_TRACING);
  sat_get_contoller()->configureCurrentThread("main", 0);
  tTest test;
  ::_tcmalloc();

  //test_types();
  //test.test_alloc_perf();
  test.test_alloc();

  printf("> done.\n");
  fflush(stdout);

  return sat_connect(host, config);
}
