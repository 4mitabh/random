Clear-Host
Add-Type -AssemblyName System.Windows.Forms
$WShell = New-Object -com "Wscript.Shell"
$PlusOrMinus = 10

Add-Type -Name ConsoleUtils -Namespace WPIA -MemberDefinition @'
   [DllImport("Kernel32.dll")]
   public static extern IntPtr GetConsoleWindow();
   [DllImport("user32.dll")]
   public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
'@

$ConsoleMode = @{ HIDDEN = 0;NORMAL = 1; MINIMIZED = 2; MAXIMIZED = 3; SHOW = 5; RESTORE = 9;}
$hWnd = [WPIA.ConsoleUtils]::GetConsoleWindow()

$a = [WPIA.ConsoleUtils]::ShowWindow($hWnd, $ConsoleMode.MINIMIZED)

# $a = [WPIA.ConsoleUtils]::ShowWindow($hWnd, $ConsoleMode.HIDDEN)
# $a = [WPIA.ConsoleUtils]::ShowWindow($hWnd, $ConsoleMode.SHOW)

while ($true)
{
  $WShell.sendkeys("{SCROLLLOCK}")
  Start-Sleep -Milliseconds 100
  $WShell.sendkeys("{SCROLLLOCK}")
  Start-Sleep -Seconds 40
  $p = [System.Windows.Forms.Cursor]::Position
  $x = $p.X + $PlusOrMinus
  $y = $p.Y + $PlusOrMinus
  [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($x, $y)
  # $PlusOrMinus *= -10
}