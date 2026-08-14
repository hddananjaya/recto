"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDown, SearchIcon } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type PhoneInputChrome = {
  unified?: boolean;
};

const PhoneInputChromeContext = React.createContext<PhoneInputChrome>({});

function usePhoneInputChrome() {
  return React.useContext(PhoneInputChromeContext);
}

function guessDefaultCountry(): RPNInput.Country {
  if (typeof navigator === "undefined") return "US";
  try {
    const locale = new Intl.Locale(navigator.language);
    if (locale.region) return locale.region as RPNInput.Country;
  } catch {
    // Intl.Locale unsupported or invalid language tag
  }
  return "US";
}

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
    /** Single-shell styling for public forms (shared border/bg/focus) */
    shellClassName?: string;
  };

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, shellClassName, onChange, value, defaultCountry, ...props }, ref) => {
  const resolvedCountry = defaultCountry ?? guessDefaultCountry();
  const unified = Boolean(shellClassName);
  const chrome = useMemo(() => ({ unified }), [unified]);

  return (
    <PhoneInputChromeContext.Provider value={chrome}>
      <RPNInput.default
        ref={ref}
        className={cn("flex w-full items-center", shellClassName, className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        smartCaret={false}
        international
        defaultCountry={resolvedCountry}
        value={value || undefined}
        onChange={(next) => onChange?.(next || ("" as RPNInput.Value))}
        {...props}
      />
    </PhoneInputChromeContext.Provider>
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const { unified } = usePhoneInputChrome();

  return (
    <Input
      ref={ref}
      type="tel"
      autoComplete="tel-national"
      className={cn(
        unified
          ? "h-14 min-h-14 min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 py-0 text-[17px] shadow-none ring-0 focus-visible:z-10 focus-visible:border-transparent focus-visible:ring-0 sm:h-12 sm:min-h-12 sm:text-base"
          : "rounded-s-none rounded-e-[var(--form-radius,1rem)] border-l-0 bg-secondary text-lg focus-visible:z-10",
        className,
      )}
      {...props}
    />
  );
});
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

function filterCountries(
  countryList: CountryEntry[],
  query: string,
): CountryEntry[] {
  const entries = countryList.filter(
    (entry): entry is { label: string; value: RPNInput.Country } =>
      Boolean(entry.value),
  );
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter(({ label, value }) => {
    const slug = value.replaceAll("_", " ").toLowerCase();
    return (
      label.toLowerCase().includes(normalized) || slug.includes(normalized)
    );
  });
}

function CountrySelectTrigger({
  disabled,
  selectedCountry,
  onClick,
}: {
  disabled?: boolean;
  selectedCountry: RPNInput.Country;
  onClick?: () => void;
}) {
  const { unified } = usePhoneInputChrome();

  if (unified) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="inline-flex h-14 shrink-0 items-center gap-1.5 border-0 border-r border-border/60 bg-transparent px-3 text-foreground transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 sm:h-12"
        aria-label="Select country"
      >
        <FlagComponent country={selectedCountry} countryName={selectedCountry} />
        <ChevronsUpDown
          className={cn("size-4 shrink-0 opacity-50", disabled && "hidden")}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 gap-1 rounded-e-none rounded-s-[var(--form-radius,1rem)] border-r-0 bg-secondary px-3 focus-visible:z-10"
      disabled={disabled}
      onClick={onClick}
    >
      <FlagComponent country={selectedCountry} countryName={selectedCountry} />
      <ChevronsUpDown
        className={cn(
          "-mr-1 size-4 opacity-50",
          disabled ? "hidden" : "opacity-100",
        )}
      />
    </Button>
  );
}

function CountryListItem({
  country,
  countryName,
  selectedCountry,
  onSelect,
}: {
  country: RPNInput.Country;
  countryName: string;
  selectedCountry: RPNInput.Country;
  onSelect: (country: RPNInput.Country) => void;
}) {
  const selected = country === selectedCountry;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(country)}
      className={cn(
        "flex w-full min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors active:bg-muted",
        selected && "bg-muted/70",
      )}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="min-w-0 flex-1 truncate">{countryName}</span>
      <span className="shrink-0 text-sm text-muted-foreground">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
        aria-hidden
      />
    </button>
  );
}

function MobileCountrySheet({
  open,
  onOpenChange,
  selectedCountry,
  countries,
  onSelectCountry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountry: RPNInput.Country;
  countries: CountryEntry[];
  onSelectCountry: (country: RPNInput.Country) => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  const filteredCountries = useMemo(
    () => filterCountries(countries, searchValue),
    [countries, searchValue],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setSearchValue("");
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[min(85dvh,560px)] gap-0 overflow-hidden rounded-t-[1.25rem] border-t p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-3 pt-2">
          <div
            className="mb-3 h-1 w-10 rounded-full bg-muted-foreground/25"
            aria-hidden
          />
          <SheetTitle className="w-full text-center text-base font-semibold">
            Country code
          </SheetTitle>
        </div>
        <div className="shrink-0 border-b border-border p-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search country..."
              className="h-11 pl-9 text-base"
              autoComplete="off"
            />
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
          role="listbox"
          aria-label="Countries"
        >
          {open ? (
            filteredCountries.length > 0 ? (
              filteredCountries.map(({ value, label }) => (
                <CountryListItem
                  key={value}
                  country={value}
                  countryName={label}
                  selectedCountry={selectedCountry}
                  onSelect={(country) => {
                    onSelectCountry(country);
                    onOpenChange(false);
                  }}
                />
              ))
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No country found.
              </p>
            )
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopCountryPopover({
  open,
  onOpenChange,
  disabled,
  selectedCountry,
  countries,
  onSelectCountry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  selectedCountry: RPNInput.Country;
  countries: CountryEntry[];
  onSelectCountry: (country: RPNInput.Country) => void;
}) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setSearchValue("");
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        render={
          <CountrySelectTrigger
            disabled={disabled}
            selectedCountry={selectedCountry}
          />
        }
      />
      {open ? (
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={searchValue}
              onValueChange={(next) => {
                setSearchValue(next);
                setTimeout(() => {
                  const viewport = scrollAreaRef.current?.querySelector(
                    '[data-slot="scroll-area-viewport"]',
                  );
                  if (viewport) viewport.scrollTop = 0;
                }, 0);
              }}
              placeholder="Search country..."
            />
            <CommandList>
              <ScrollArea ref={scrollAreaRef} className="h-72">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {filterCountries(countries, searchValue).map(
                    ({ value, label }) =>
                      value ? (
                        <CountrySelectOption
                          key={value}
                          country={value}
                          countryName={label}
                          selectedCountry={selectedCountry}
                          onChange={onSelectCountry}
                          onSelectComplete={() => onOpenChange(false)}
                        />
                      ) : null,
                  )}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <CountrySelectTrigger
          disabled={disabled}
          selectedCountry={selectedCountry}
          onClick={() => !disabled && setIsOpen(true)}
        />
        <MobileCountrySheet
          open={isOpen}
          onOpenChange={setIsOpen}
          selectedCountry={selectedCountry}
          countries={countryList}
          onSelectCountry={onChange}
        />
      </>
    );
  }

  return (
    <DesktopCountryPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
      selectedCountry={selectedCountry}
      countries={countryList}
      onSelectCountry={onChange}
    />
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem
      className="gap-2 [&>svg:last-child]:hidden"
      onSelect={handleSelect}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-muted-foreground">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={cn(
          "ml-auto size-4",
          country === selectedCountry ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
};

export { PhoneInput };
