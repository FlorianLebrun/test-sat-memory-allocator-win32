#include <sat-memory-allocator-win32>
#include <sat-memory-inspector>

#include <vector>
#include <assert.h>
#include "./test_alloc.h"

struct myClass2 {
  static SAT::tTypeID typeID;
  uint32_t x;
};
SAT::tTypeID myClass2::typeID = 0;

struct myClass1 {
  static SAT::tTypeID typeID;
  myClass1* x;
  myClass2* y;
};
SAT::tTypeID myClass1::typeID = 0;

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
    if (1) {
      for (int i = remain; i < count; i++) {
        int k = fastrand() % objects.size();
        void* obj = objects[k];
        objects[k] = objects.back();
        objects.pop_back();
        sat_free(obj);
      }
    }
    else if (0) {
      for (int i = remain; i < count; i++) {
        void* obj = objects.back();
        objects.pop_back();
        sat_free(obj);
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
    {
      SAT::ITypesController* types = sat_get_types_controller();
      SAT::TypeDef def_uint32_t = types->createBufferType("uint32_t", SAT::ENC_INT, sizeof(uint32_t));
      SAT::TypeDef def_myClass1 = types->createClassType("myClass1", sizeof(myClass1), 2, 0);
      SAT::TypeDef def_myClass2 = types->createClassType("myClass2", sizeof(myClass2), 0, 1);

      def_myClass1->setRef(0, &SAT::tTypeDef::zero<myClass1>().x, def_myClass2);
      def_myClass1->setRef(1, &SAT::tTypeDef::zero<myClass1>().y, def_myClass2);
      myClass1::typeID = def_myClass1->getID();

      def_myClass2->setBuffer(0, &SAT::tTypeDef::zero<myClass2>().x, def_uint32_t);
      myClass2::typeID = def_myClass2->getID();
    }

    Chrono c;
    static const int count = 50000;
    std::vector<myClass1*> objects(count);
    c.Start();

    for (int i = 0; i < count; i++) {
      objects[i] = new (sat_malloc_ex(myClass1::typeID)) myClass1();
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
      virtual void visit(SAT::tpObjectInfos obj) override {
        printf("%.8X\n", obj->base);
      }
    };
    sat_get_contoller()->traverseObjects(&Visitor());
  }
  
  __declspec(noinline) void test_alloc_perf()
  {
    int size_min = 10, size_max = 5000;
    MultiThreadAllocTest<4> multi;
#define TestID 3
#if TestID == 1
    DefaultAllocTest().Run(size_min, size_max);
    multi.Run(&DefaultAllocTest(), size_min, size_max);
#elif TestID == 2
    TCmallocAllocTest().Run(size_min, size_max);
    multi.Run(&TCmallocAllocTest(), size_min, size_max);
#elif TestID == 3
    SATmallocAllocTest().Run(size_min, size_max);
    //multi.Run(&SATmallocAllocTest(), size_min, size_max);
#endif
  }

  void test_alloc()
  {
    SAT::IController* sat = sat_get_contoller();
    SAT::ISampler* sampler = sat->getSampler();
    sampler->watchThread(GetCurrentThreadId());

    sampler->emitMark("sat_malloc");
    //this->test_sat_malloc();
    Sleep(100);

    sampler->emitMark("tc_malloc");
    this->test_tc_malloc();
    Sleep(50);

    this->test_sat_malloc_2();
    this->test_sat_malloc();
    Sleep(50);

    sampler->emitMark("default_malloc");
    this->test_default_malloc();

    sampler->unwatchThread(GetCurrentThreadId());
    sampler->pause();

    SAT::StackHistogram* hist = sampler->computeCallStackHistogram();
    //hist->print();
  }
};

void main() {
  tTest test;

  ::_tcmalloc();
  _satmalloc_init();

  create_tcp_server(9955);
  //test_types();
  //test_alloc_perf();
  test.test_alloc();

  printf("> done.\n");
  fflush(stdout);
  getchar();
}
