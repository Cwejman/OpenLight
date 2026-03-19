PREFIX ?= /usr/local

.PHONY: build install uninstall test

build:
	zig build -Doptimize=ReleaseSafe

test:
	zig build test

install: build
	cp zig-out/bin/ol $(PREFIX)/bin/ol

uninstall:
	rm -f $(PREFIX)/bin/ol
