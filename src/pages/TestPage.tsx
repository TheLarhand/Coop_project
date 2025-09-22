import ApiStatus from "../features/Clicker/ApiStatus/ApiStatus";
import Clicker from "../features/Clicker/Clicker";
import Demo from "../features/Demo/Demo";
import MainLayout from "../layouts/MainLayout";

function TestPage() {

  return (
    <div>
      <MainLayout>
        <h1>Тестовая страница</h1>
        <ApiStatus/>
        <Clicker/>
        <Demo/>
      </MainLayout>
    </div>
  );
}

export default TestPage;
