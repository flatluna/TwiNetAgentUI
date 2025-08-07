import AppRouter from "@/router/AppRouter";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <UserProvider>
                    <div className="App">
                        <AppRouter />
                    </div>
                </UserProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
